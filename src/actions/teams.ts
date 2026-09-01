'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { teamRequestSchema, teamRosterSchema } from '@/lib/validation/schemas';
import type { TeamRole } from '@/lib/db/types';

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
