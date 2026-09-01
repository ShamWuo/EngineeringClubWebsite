'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { workshopSchema, workshopRequestSchema } from '@/lib/validation/schemas';
import type { WorkshopStatus } from '@/lib/db/types';

export const upsertWorkshop = createAction(
  workshopSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (input.id) {
      if (supabase) {
        await supabase
          .from('workshops')
          .update({
            slug: input.slug,
            title: input.title,
            description: input.description || null,
            instructor_id: input.instructor_id || null,
            instructor_name: input.instructor_name || null,
            status: input.status as WorkshopStatus,
            starts_at: input.starts_at || null,
            ends_at: input.ends_at || null,
            location: input.location || null,
            capacity: input.capacity || null,
            skill_level: input.skill_level || null,
            materials_url: input.materials_url || null,
            recording_url: input.recording_url || null,
            updated_at: now,
          })
          .eq('id', input.id);
      }

      const workshop = db.workshops.find((w) => w.id === input.id);
      if (workshop) {
        workshop.slug = input.slug;
        workshop.title = input.title;
        workshop.description = input.description || null;
        workshop.instructor_id = input.instructor_id || null;
        workshop.instructor_name = input.instructor_name || null;
        workshop.status = input.status as WorkshopStatus;
        workshop.starts_at = input.starts_at || null;
        workshop.ends_at = input.ends_at || null;
        workshop.location = input.location || null;
        workshop.capacity = input.capacity || null;
        workshop.skill_level = input.skill_level || null;
        workshop.materials_url = input.materials_url || null;
        workshop.recording_url = input.recording_url || null;
        workshop.updated_at = now;
      }

      safeRevalidatePath('/workshops');
      safeRevalidatePath(`/workshops/${input.slug}`);
      safeRevalidatePath('/manage/workshops');
      return { workshop: workshop || { id: input.id, ...input } };
    } else {
      const newId = crypto.randomUUID();
      const newWorkshop = {
        id: newId,
        slug: input.slug,
        title: input.title,
        description: input.description || null,
        instructor_id: input.instructor_id || null,
        instructor_name: input.instructor_name || null,
        status: input.status as WorkshopStatus,
        starts_at: input.starts_at || null,
        ends_at: input.ends_at || null,
        location: input.location || null,
        capacity: input.capacity || null,
        skill_level: input.skill_level || null,
        materials_url: input.materials_url || null,
        recording_url: input.recording_url || null,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      };

      if (supabase) {
        await supabase.from('workshops').insert(newWorkshop);
      }

      db.workshops.push(newWorkshop);
      safeRevalidatePath('/workshops');
      safeRevalidatePath('/manage/workshops');
      return { workshop: newWorkshop };
    }
  }
);

export const rsvpWorkshop = createAction(
  z.object({ workshop_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase.from('workshop_rsvps').insert({
        workshop_id: input.workshop_id,
        user_id: user.id,
        attended: false,
        created_at: now,
      });
    }

    const rsvp = {
      workshop_id: input.workshop_id,
      user_id: user.id,
      attended: false,
      created_at: now,
    };

    db.workshop_rsvps.push(rsvp);

    safeRevalidatePath('/workshops');
    safeRevalidatePath('/dashboard');
    return { rsvp };
  }
);

export const cancelWorkshopRsvp = createAction(
  z.object({ workshop_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    if (supabase) {
      await supabase
        .from('workshop_rsvps')
        .delete()
        .eq('workshop_id', input.workshop_id)
        .eq('user_id', user.id);
    }

    const idx = db.workshop_rsvps.findIndex(
      (r) => r.workshop_id === input.workshop_id && r.user_id === user.id
    );
    if (idx !== -1) {
      db.workshop_rsvps.splice(idx, 1);
    }

    safeRevalidatePath('/workshops');
    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);

export const submitWorkshopRequest = createAction(
  workshopRequestSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();
    const reqId = crypto.randomUUID();

    const req = {
      id: reqId,
      requested_by: user.id,
      topic: input.topic,
      rationale: input.rationale || null,
      offering_to_teach: input.offering_to_teach,
      preferred_timeframe: input.preferred_timeframe || null,
      status: 'pending' as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
      created_workshop_id: null,
      created_at: now,
      updated_at: now,
    };

    if (supabase) {
      await supabase.from('workshop_requests').insert(req);

      const { data: officers } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['officer', 'admin']);

      if (officers && officers.length > 0) {
        const notifications = officers.map((off: { id: string }) => ({
          user_id: off.id,
          kind: 'new_request',
          title: 'New Workshop Suggestion 💡',
          body: `${user.full_name || user.email} suggested "${input.topic}"`,
          href: '/review',
        }));
        await supabase.from('notifications').insert(notifications);
      }
    }

    db.workshop_requests.push(req);

    safeRevalidatePath('/requests');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/review');
    return { request: req };
  }
);

export const toggleVoteWorkshopRequest = createAction(
  z.object({ request_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const existingIdx = db.workshop_request_votes.findIndex(
      (v) => v.request_id === input.request_id && v.user_id === user.id
    );

    if (existingIdx !== -1) {
      if (supabase) {
        await supabase
          .from('workshop_request_votes')
          .delete()
          .eq('request_id', input.request_id)
          .eq('user_id', user.id);
      }
      db.workshop_request_votes.splice(existingIdx, 1);
      safeRevalidatePath('/workshops/request');
      return { voted: false };
    } else {
      const vote = {
        request_id: input.request_id,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      if (supabase) {
        await supabase.from('workshop_request_votes').insert(vote);
      }
      db.workshop_request_votes.push(vote);
      safeRevalidatePath('/workshops/request');
      return { voted: true };
    }
  }
);

export const markAttendance = createAction(
  z.object({
    workshop_id: z.string().uuid(),
    user_id: z.string().uuid(),
    attended: z.boolean(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { supabase, db }) => {
    if (supabase) {
      await supabase
        .from('workshop_rsvps')
        .update({ attended: input.attended })
        .eq('workshop_id', input.workshop_id)
        .eq('user_id', input.user_id);
    }
    const rsvp = db.workshop_rsvps.find(
      (r) => r.workshop_id === input.workshop_id && r.user_id === input.user_id
    );
    if (rsvp) {
      rsvp.attended = input.attended;
    }
    safeRevalidatePath('/manage/workshops');
    return { success: true };
  }
);
