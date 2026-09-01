'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { competitionSchema, competitionRequestSchema, competitionSignupSchema } from '@/lib/validation/schemas';
import type { CompStatus } from '@/lib/db/types';

export const upsertCompetition = createAction(
  competitionSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();

    if (input.id) {
      const comp = db.competitions.find((c) => c.id === input.id);
      if (!comp) throw new Error('Competition not found.');

      // Check slug uniqueness among other competitions
      const existingSlug = db.competitions.find((c) => c.slug === input.slug && c.id !== input.id);
      if (existingSlug) throw new Error('A competition with this slug already exists.');

      comp.slug = input.slug;
      comp.name = input.name;
      comp.description = input.description || null;
      comp.organizer = input.organizer || null;
      comp.status = input.status as CompStatus;
      comp.season = input.season || null;
      comp.registration_opens_at = input.registration_opens_at || null;
      comp.registration_closes_at = input.registration_closes_at || null;
      comp.event_starts_at = input.event_starts_at || null;
      comp.event_ends_at = input.event_ends_at || null;
      comp.max_teams = input.max_teams || null;
      comp.max_team_size = input.max_team_size || null;
      comp.entry_fee_cents = input.entry_fee_cents ?? 0;
      comp.external_url = input.external_url || null;
      comp.updated_at = now;

      revalidatePath('/competitions');
      revalidatePath(`/competitions/${comp.slug}`);
      revalidatePath('/manage/competitions');
      return { competition: comp };
    } else {
      const existingSlug = db.competitions.find((c) => c.slug === input.slug);
      if (existingSlug) throw new Error('A competition with this slug already exists.');

      const newComp = {
        id: crypto.randomUUID(),
        slug: input.slug,
        name: input.name,
        description: input.description || null,
        organizer: input.organizer || null,
        status: input.status as CompStatus,
        season: input.season || '2026-27',
        registration_opens_at: input.registration_opens_at || null,
        registration_closes_at: input.registration_closes_at || null,
        event_starts_at: input.event_starts_at || null,
        event_ends_at: input.event_ends_at || null,
        max_teams: input.max_teams || null,
        max_team_size: input.max_team_size || null,
        entry_fee_cents: input.entry_fee_cents ?? 0,
        external_url: input.external_url || null,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      };

      db.competitions.push(newComp);
      revalidatePath('/competitions');
      revalidatePath('/manage/competitions');
      return { competition: newComp };
    }
  }
);

export const signupForCompetition = createAction(
  competitionSignupSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const comp = db.competitions.find((c) => c.id === input.competition_id);
    if (!comp) throw new Error('Competition not found.');

    const existingSignup = db.competition_signups.find(
      (s) => s.competition_id === input.competition_id && s.user_id === user.id
    );

    if (existingSignup) {
      existingSignup.note = input.note || null;
      existingSignup.status = 'pending';
      existingSignup.updated_at = new Date().toISOString();
      revalidatePath(`/competitions/${comp.slug}`);
      revalidatePath('/dashboard');
      return { signup: existingSignup };
    }

    const signup = {
      id: crypto.randomUUID(),
      competition_id: input.competition_id,
      user_id: user.id,
      note: input.note || null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.competition_signups.push(signup);
    revalidatePath(`/competitions/${comp.slug}`);
    revalidatePath('/dashboard');
    return { signup };
  }
);

export const cancelCompetitionSignup = createAction(
  z.object({ competition_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const index = db.competition_signups.findIndex(
      (s) => s.competition_id === input.competition_id && s.user_id === user.id
    );
    if (index === -1) throw new Error('Signup not found.');

    db.competition_signups.splice(index, 1);
    revalidatePath('/competitions');
    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const submitCompetitionRequest = createAction(
  competitionRequestSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const now = new Date().toISOString();
    const req = {
      id: crypto.randomUUID(),
      requested_by: user.id,
      name: input.name,
      organizer: input.organizer || null,
      url: input.url || null,
      why: input.why,
      estimated_cost_cents: input.estimated_cost_cents || 0,
      estimated_team_size: input.estimated_team_size || null,
      deadline: input.deadline || null,
      status: 'pending' as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_competition_id: null,
      created_at: now,
      updated_at: now,
    };

    db.competition_requests.push(req);

    // Notify officers
    db.profiles
      .filter((p) => p.role === 'officer' || p.role === 'admin')
      .forEach((officer) => {
        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: officer.id,
          kind: 'new_request',
          title: 'New Competition Proposal 📋',
          body: `${user.full_name || user.email} proposed "${input.name}"`,
          href: '/review',
          read_at: null,
          created_at: now,
        });
      });

    revalidatePath('/dashboard');
    revalidatePath('/review');
    return { request: req };
  }
);
