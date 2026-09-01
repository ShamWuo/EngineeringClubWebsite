'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { competitionSchema, competitionRequestSchema, competitionSignupSchema } from '@/lib/validation/schemas';
import type { CompStatus } from '@/lib/db/types';

export const upsertCompetition = createAction(
  competitionSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (input.id) {
      if (supabase) {
        await supabase
          .from('competitions')
          .update({
            slug: input.slug,
            name: input.name,
            description: input.description || null,
            organizer: input.organizer || null,
            status: input.status as CompStatus,
            season: input.season || null,
            registration_opens_at: input.registration_opens_at || null,
            registration_closes_at: input.registration_closes_at || null,
            event_starts_at: input.event_starts_at || null,
            event_ends_at: input.event_ends_at || null,
            max_teams: input.max_teams || null,
            max_team_size: input.max_team_size || null,
            entry_fee_cents: input.entry_fee_cents ?? 0,
            external_url: input.external_url || null,
            updated_at: now,
          })
          .eq('id', input.id);
      }

      const comp = db.competitions.find((c) => c.id === input.id);
      if (comp) {
        comp.slug = input.slug;
        comp.name = input.name;
        comp.description = input.description || null;
        comp.organizer = input.organizer || null;
        comp.status = input.status as CompStatus;
        comp.season = input.season || null;
        comp.updated_at = now;
      }

      safeRevalidatePath('/competitions');
      safeRevalidatePath(`/competitions/${input.slug}`);
      safeRevalidatePath('/manage/competitions');
      return { competition: comp || { id: input.id, ...input } };
    } else {
      const newCompId = crypto.randomUUID();
      const newComp = {
        id: newCompId,
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

      if (supabase) {
        await supabase.from('competitions').insert(newComp);
      }

      db.competitions.push(newComp);
      safeRevalidatePath('/competitions');
      safeRevalidatePath('/manage/competitions');
      return { competition: newComp };
    }
  }
);

export const signupForCompetition = createAction(
  competitionSignupSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      const { data: existing } = await supabase
        .from('competition_signups')
        .select('*')
        .eq('competition_id', input.competition_id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('competition_signups')
          .update({ note: input.note || null, status: 'pending', updated_at: now })
          .eq('id', existing.id);
      } else {
        await supabase.from('competition_signups').insert({
          id: crypto.randomUUID(),
          competition_id: input.competition_id,
          user_id: user.id,
          note: input.note || null,
          status: 'pending',
          created_at: now,
          updated_at: now,
        });
      }
    }

    const existingSignup = db.competition_signups.find(
      (s) => s.competition_id === input.competition_id && s.user_id === user.id
    );

    if (existingSignup) {
      existingSignup.note = input.note || null;
      existingSignup.status = 'pending';
      existingSignup.updated_at = now;
      safeRevalidatePath('/competitions');
      safeRevalidatePath('/dashboard');
      return { signup: existingSignup };
    }

    const signup = {
      id: crypto.randomUUID(),
      competition_id: input.competition_id,
      user_id: user.id,
      note: input.note || null,
      status: 'pending' as const,
      created_at: now,
      updated_at: now,
    };

    db.competition_signups.push(signup);
    safeRevalidatePath('/competitions');
    safeRevalidatePath('/dashboard');
    return { signup };
  }
);

export const cancelCompetitionSignup = createAction(
  z.object({ competition_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    if (supabase) {
      await supabase
        .from('competition_signups')
        .delete()
        .eq('competition_id', input.competition_id)
        .eq('user_id', user.id);
    }

    const index = db.competition_signups.findIndex(
      (s) => s.competition_id === input.competition_id && s.user_id === user.id
    );
    if (index !== -1) {
      db.competition_signups.splice(index, 1);
    }

    safeRevalidatePath('/competitions');
    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);

export const submitCompetitionRequest = createAction(
  competitionRequestSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const reqId = crypto.randomUUID();
    const req = {
      id: reqId,
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

    if (supabase) {
      await supabase.from('competition_requests').insert(req);
      
      // Notify officers in Supabase
      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['officer', 'admin']);

      if (officers && officers.length > 0) {
        const notifications = officers.map((off: { id: string }) => ({
          user_id: off.id,
          kind: 'new_request',
          title: 'New Competition Proposal 📋',
          body: `${user.full_name || user.email} proposed "${input.name}"`,
          href: '/review',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    db.competition_requests.push(req);

    safeRevalidatePath('/requests');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/review');
    return { request: req };
  }
);
