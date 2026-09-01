'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { teamRequestSchema, teamRosterUpdateSchema } from '@/lib/validation/schemas';
import type { TeamRole } from '@/lib/db/types';

export const submitTeamRequest = createAction(
  teamRequestSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const comp = db.competitions.find((c) => c.id === input.competition_id);
    if (!comp) throw new Error('Competition not found.');

    const now = new Date().toISOString();

    const proposedMembers = Array.from(
      new Set([user.id, ...(input.proposed_member_ids || [])])
    );

    const teamReq = {
      id: crypto.randomUUID(),
      competition_id: input.competition_id,
      requested_by: user.id,
      proposed_name: input.proposed_name,
      purpose: input.purpose || null,
      proposed_member_ids: proposedMembers,
      needs_funding: input.needs_funding,
      status: 'pending' as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_team_id: null,
      created_at: now,
      updated_at: now,
    };

    db.team_requests.push(teamReq);

    // Notify officers
    db.profiles
      .filter((p) => p.role === 'officer' || p.role === 'admin')
      .forEach((officer) => {
        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: officer.id,
          kind: 'new_request',
          title: 'New Team Request 🏎️',
          body: `${user.full_name || user.email} requested team "${input.proposed_name}" for ${comp.name}`,
          href: '/review',
          read_at: null,
          created_at: now,
        });
      });

    revalidatePath('/dashboard');
    revalidatePath('/review');
    return { request: teamReq };
  }
);

export const joinTeam = createAction(
  z.object({ team_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const team = db.teams.find((t) => t.id === input.team_id);
    if (!team) throw new Error('Team not found.');

    const existingMember = db.team_members.find(
      (m) => m.team_id === input.team_id && m.user_id === user.id
    );
    if (existingMember) throw new Error('You are already a member of this team.');

    const newMember = {
      team_id: input.team_id,
      user_id: user.id,
      role: 'member' as TeamRole,
      joined_at: new Date().toISOString(),
    };

    db.team_members.push(newMember);

    // Auto-approve competition signup if any
    const signup = db.competition_signups.find(
      (s) => s.competition_id === team.competition_id && s.user_id === user.id
    );
    if (signup) {
      signup.status = 'approved';
    }

    revalidatePath(`/teams/${team.id}`);
    revalidatePath('/dashboard');
    return { member: newMember };
  }
);

export const leaveTeam = createAction(
  z.object({ team_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const memberIndex = db.team_members.findIndex(
      (m) => m.team_id === input.team_id && m.user_id === user.id
    );
    if (memberIndex === -1) throw new Error('You are not a member of this team.');

    db.team_members.splice(memberIndex, 1);

    revalidatePath(`/teams/${input.team_id}`);
    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const updateTeamRoster = createAction(
  teamRosterUpdateSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const team = db.teams.find((t) => t.id === input.team_id);
    if (!team) throw new Error('Team not found.');

    const isLead = db.team_members.some(
      (m) => m.team_id === input.team_id && m.user_id === user.id && m.role === 'lead'
    );
    const isOfficer = user.role === 'officer' || user.role === 'admin';

    if (!isLead && !isOfficer) {
      throw new Error('Unauthorized: Only team leads or officers can edit the roster.');
    }

    if (input.action === 'add') {
      const existing = db.team_members.find(
        (m) => m.team_id === input.team_id && m.user_id === input.user_id
      );
      if (!existing) {
        db.team_members.push({
          team_id: input.team_id,
          user_id: input.user_id,
          role: input.role || 'member',
          joined_at: new Date().toISOString(),
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
      // Demote existing lead to member
      db.team_members
        .filter((m) => m.team_id === input.team_id && m.role === 'lead')
        .forEach((m) => {
          m.role = 'member';
        });

      // Promote target
      const target = db.team_members.find(
        (m) => m.team_id === input.team_id && m.user_id === input.user_id
      );
      if (target) {
        target.role = 'lead';
      } else {
        db.team_members.push({
          team_id: input.team_id,
          user_id: input.user_id,
          role: 'lead',
          joined_at: new Date().toISOString(),
        });
      }
    }

    revalidatePath(`/teams/${input.team_id}`);
    revalidatePath('/manage/teams');
    return { success: true };
  }
);

export const toggleTeamRecruiting = createAction(
  z.object({ team_id: z.string().uuid(), is_recruiting: z.boolean() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const team = db.teams.find((t) => t.id === input.team_id);
    if (!team) throw new Error('Team not found.');

    const isLead = db.team_members.some(
      (m) => m.team_id === input.team_id && m.user_id === user.id && m.role === 'lead'
    );
    const isOfficer = user.role === 'officer' || user.role === 'admin';

    if (!isLead && !isOfficer) {
      throw new Error('Unauthorized.');
    }

    team.is_recruiting = input.is_recruiting;
    team.updated_at = new Date().toISOString();

    revalidatePath(`/teams/${team.id}`);
    return { is_recruiting: team.is_recruiting };
  }
);
