'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { teamRequestSchema, teamRosterSchema, createTeamSchema, verifyTeamSchema } from '@/lib/validation/schemas';
import type { TeamRole } from '@/lib/db/types';

export const createTeam = createAction(
  createTeamSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const teamId = crypto.randomUUID();
    const reqId = crypto.randomUUID();

    const cleanMemberIds = Array.from(
      new Set((input.member_ids || []).filter((id) => id && id !== user.id))
    );

    const teamRecord = {
      id: teamId,
      competition_id: input.competition_id,
      name: input.name.trim(),
      description: input.description ? input.description.trim() : null,
      is_recruiting: true,
      is_verified: false,
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };

    const leadMember = {
      team_id: teamId,
      user_id: user.id,
      role: 'lead' as TeamRole,
      joined_at: now,
    };

    const additionalMembers = cleanMemberIds.map((mId) => ({
      team_id: teamId,
      user_id: mId,
      role: 'member' as TeamRole,
      joined_at: now,
    }));

    const allMembers = [leadMember, ...additionalMembers];

    const teamReq = {
      id: reqId,
      competition_id: input.competition_id,
      requested_by: user.id,
      proposed_name: input.name.trim(),
      purpose: input.description ? input.description.trim() : null,
      proposed_member_ids: [user.id, ...cleanMemberIds],
      needs_funding: input.needs_funding ?? false,
      status: 'pending' as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_team_id: teamId,
      created_at: now,
      updated_at: now,
    };

    if (supabase && process.env.NODE_ENV !== 'test') {
      const { error: teamErr } = await supabase.from('teams').insert(teamRecord);
      if (teamErr) {
        console.error('Error inserting team:', teamErr);
        throw new Error(teamErr.message || 'Failed to create team');
      }

      const { error: memberErr } = await supabase.from('team_members').insert(allMembers);
      if (memberErr) {
        console.error('Error inserting team members:', memberErr);
      }

      const { error: reqErr } = await supabase.from('team_requests').insert(teamReq);
      if (reqErr) {
        console.error('Error creating team verification request:', reqErr);
      }

      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['officer', 'admin']);

      if (officers && officers.length > 0) {
        const notifications = officers.map((off: { id: string }) => ({
          user_id: off.id,
          kind: 'new_request',
          title: 'New Team Needs Verification 🏎️',
          body: `${user.full_name || user.email} created team "${input.name}". Verify roster & competition alignment.`,
          href: `/teams/${teamId}`,
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    db.teams.push(teamRecord);
    for (const m of allMembers) {
      db.team_members.push(m);
    }
    db.team_requests.push(teamReq);

    safeRevalidatePath('/teams');
    safeRevalidatePath(`/teams/${teamId}`);
    safeRevalidatePath('/competitions');
    safeRevalidatePath('/review');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/requests');

    return { team: teamRecord, request: teamReq };
  }
);

export const verifyTeamAction = createAction(
  verifyTeamSchema,
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase && process.env.NODE_ENV !== 'test') {
      const { error: teamErr } = await supabase
        .from('teams')
        .update({ is_verified: true, updated_at: now })
        .eq('id', input.team_id);

      if (teamErr) {
        console.error('Error verifying team in Supabase:', teamErr);
        throw new Error(teamErr.message || 'Failed to verify team');
      }

      const { data: updatedReqs } = await supabase
        .from('team_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: now,
          review_note: input.note || 'Verified by officer',
          updated_at: now,
        })
        .eq('created_team_id', input.team_id)
        .eq('status', 'pending')
        .select('requested_by, proposed_name');

      if (updatedReqs && updatedReqs.length > 0) {
        for (const req of updatedReqs) {
          await supabase.from('notifications').insert({
            user_id: req.requested_by,
            kind: 'team_approved',
            title: 'Team Verified! 🎉',
            body: `Your team "${req.proposed_name}" has been officially verified by officers.`,
            href: `/teams/${input.team_id}`,
          });
        }
      }
    }

    const team = db.teams.find((t) => t.id === input.team_id);
    if (team) {
      team.is_verified = true;
      team.updated_at = now;
    }

    const pendingReqs = db.team_requests.filter(
      (r) => r.created_team_id === input.team_id && r.status === 'pending'
    );
    for (const req of pendingReqs) {
      req.status = 'approved';
      req.reviewed_by = user.id;
      req.reviewed_at = now;
      req.review_note = input.note || 'Verified by officer';
      req.updated_at = now;
    }

    safeRevalidatePath('/teams');
    safeRevalidatePath(`/teams/${input.team_id}`);
    safeRevalidatePath('/competitions');
    safeRevalidatePath('/review');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/requests');

    return { success: true, team_id: input.team_id };
  }
);

export const submitTeamRequest = createAction(
  teamRequestSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const reqId = crypto.randomUUID();
    const members = Array.from(new Set([user.id, ...(input.proposed_member_ids || [])]));

    const req = {
      id: reqId,
      competition_id: input.competition_id,
      requested_by: user.id,
      proposed_name: input.proposed_name,
      purpose: input.purpose || null,
      proposed_member_ids: members,
      needs_funding: input.needs_funding,
      status: 'pending' as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_team_id: null,
      created_at: now,
      updated_at: now,
    };

    if (supabase) {
      await supabase.from('team_requests').insert(req);

      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['officer', 'admin']);

      if (officers && officers.length > 0) {
        const notifications = officers.map((off: { id: string }) => ({
          user_id: off.id,
          kind: 'new_request',
          title: 'New Team Request 🏎️',
          body: `${user.full_name || user.email} requested team "${input.proposed_name}"`,
          href: '/review',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    db.team_requests.push(req);

    safeRevalidatePath('/requests');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/review');
    return { request: req };
  }
);

export const joinTeam = createAction(
  z.object({ team_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase.from('team_members').insert({
        team_id: input.team_id,
        user_id: user.id,
        role: 'member',
        joined_at: now,
      });
    }

    const member = {
      team_id: input.team_id,
      user_id: user.id,
      role: 'member' as TeamRole,
      joined_at: now,
    };

    db.team_members.push(member);

    safeRevalidatePath(`/teams/${input.team_id}`);
    safeRevalidatePath('/dashboard');
    return { member };
  }
);

export const leaveTeam = createAction(
  z.object({ team_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    if (supabase) {
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', input.team_id)
        .eq('user_id', user.id);
    }

    const idx = db.team_members.findIndex(
      (m) => m.team_id === input.team_id && m.user_id === user.id
    );
    if (idx !== -1) {
      db.team_members.splice(idx, 1);
    }

    safeRevalidatePath(`/teams/${input.team_id}`);
    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);

export const manageTeamRoster = createAction(
  teamRosterSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      if (input.action === 'add') {
        await supabase.from('team_members').insert({
          team_id: input.team_id,
          user_id: input.user_id,
          role: (input.role as TeamRole) || 'member',
          joined_at: now,
        });
      } else if (input.action === 'remove') {
        await supabase
          .from('team_members')
          .delete()
          .eq('team_id', input.team_id)
          .eq('user_id', input.user_id);
      } else if (input.action === 'set_lead') {
        await supabase
          .from('team_members')
          .update({ role: 'member' })
          .eq('team_id', input.team_id)
          .eq('role', 'lead');

        await supabase
          .from('team_members')
          .update({ role: 'lead' })
          .eq('team_id', input.team_id)
          .eq('user_id', input.user_id);
      }
    }

    if (input.action === 'add') {
      const exists = db.team_members.some(
        (m) => m.team_id === input.team_id && m.user_id === input.user_id
      );
      if (!exists) {
        db.team_members.push({
          team_id: input.team_id,
          user_id: input.user_id,
          role: (input.role as TeamRole) || 'member',
          joined_at: now,
        });
      }
    } else if (input.action === 'remove') {
      const idx = db.team_members.findIndex(
        (m) => m.team_id === input.team_id && m.user_id === input.user_id
      );
      if (idx !== -1) {
        db.team_members.splice(idx, 1);
      }
    } else if (input.action === 'set_lead') {
      db.team_members
        .filter((m) => m.team_id === input.team_id && m.role === 'lead')
        .forEach((m) => {
          m.role = 'member';
        });

      const member = db.team_members.find(
        (m) => m.team_id === input.team_id && m.user_id === input.user_id
      );
      if (member) {
        member.role = 'lead';
      } else {
        db.team_members.push({
          team_id: input.team_id,
          user_id: input.user_id,
          role: 'lead',
          joined_at: now,
        });
      }
    }

    safeRevalidatePath(`/teams/${input.team_id}`);
    safeRevalidatePath('/manage/teams');
    return { success: true };
  }
);

export const updateTeamRoster = manageTeamRoster;

export const toggleTeamRecruiting = createAction(
  z.object({ team_id: z.string().uuid(), is_recruiting: z.boolean() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    if (supabase) {
      await supabase
        .from('teams')
        .update({ is_recruiting: input.is_recruiting, updated_at: new Date().toISOString() })
        .eq('id', input.team_id);
    }

    const team = db.teams.find((t) => t.id === input.team_id);
    if (team) {
      team.is_recruiting = input.is_recruiting;
      team.updated_at = new Date().toISOString();
    }

    safeRevalidatePath(`/teams/${input.team_id}`);
    return { is_recruiting: input.is_recruiting };
  }
);
