'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { workshopSchema, workshopRequestSchema, workshopRsvpSchema } from '@/lib/validation/schemas';
import type { WorkshopStatus } from '@/lib/db/types';

export const upsertWorkshop = createAction(
  workshopSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();

    if (input.id) {
      const workshop = db.workshops.find((w) => w.id === input.id);
      if (!workshop) throw new Error('Workshop not found.');

      const existingSlug = db.workshops.find((w) => w.slug === input.slug && w.id !== input.id);
      if (existingSlug) throw new Error('A workshop with this slug already exists.');

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

      revalidatePath('/workshops');
      revalidatePath(`/workshops/${workshop.slug}`);
      revalidatePath('/manage/workshops');
      return { workshop };
    } else {
      const existingSlug = db.workshops.find((w) => w.slug === input.slug);
      if (existingSlug) throw new Error('A workshop with this slug already exists.');

      const newWorkshop = {
        id: crypto.randomUUID(),
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

      db.workshops.push(newWorkshop);
      revalidatePath('/workshops');
      revalidatePath('/manage/workshops');
      return { workshop: newWorkshop };
    }
  }
);

export const rsvpWorkshop = createAction(
  workshopRsvpSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const workshop = db.workshops.find((w) => w.id === input.workshop_id);
    if (!workshop) throw new Error('Workshop not found.');

    const existingRsvp = db.workshop_rsvps.find(
      (r) => r.workshop_id === input.workshop_id && r.user_id === user.id
    );

    if (existingRsvp) {
      return { rsvp: existingRsvp };
    }

    // Check capacity
    const currentCount = db.workshop_rsvps.filter((r) => r.workshop_id === input.workshop_id).length;
    if (workshop.capacity && currentCount >= workshop.capacity) {
      throw new Error('This workshop has reached maximum capacity.');
    }

    const rsvp = {
      workshop_id: input.workshop_id,
      user_id: user.id,
      attended: false,
      created_at: new Date().toISOString(),
    };

    db.workshop_rsvps.push(rsvp);
    revalidatePath(`/workshops/${workshop.slug}`);
    revalidatePath('/workshops');
    revalidatePath('/dashboard');
    return { rsvp };
  }
);

export const cancelWorkshopRsvp = createAction(
  z.object({ workshop_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const idx = db.workshop_rsvps.findIndex(
      (r) => r.workshop_id === input.workshop_id && r.user_id === user.id
    );
    if (idx === -1) throw new Error('RSVP not found.');

    db.workshop_rsvps.splice(idx, 1);

    const workshop = db.workshops.find((w) => w.id === input.workshop_id);
    if (workshop) {
      revalidatePath(`/workshops/${workshop.slug}`);
    }
    revalidatePath('/workshops');
    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const submitWorkshopRequest = createAction(
  workshopRequestSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const now = new Date().toISOString();
    const req = {
      id: crypto.randomUUID(),
      requested_by: user.id,
      topic: input.topic,
      rationale: input.rationale,
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

    db.workshop_requests.push(req);

    // Initial vote by requester
    db.workshop_request_votes.push({
      request_id: req.id,
      user_id: user.id,
      created_at: now,
    });

    // Notify officers
    db.profiles
      .filter((p) => p.role === 'officer' || p.role === 'admin')
      .forEach((officer) => {
        db.notifications.push({
          id: crypto.randomUUID(),
          user_id: officer.id,
          kind: 'new_request',
          title: 'New Workshop Topic Proposed 💡',
          body: `${user.full_name || user.email} requested "${input.topic}"`,
          href: '/review',
          read_at: null,
          created_at: now,
        });
      });

    revalidatePath('/workshops/request');
    revalidatePath('/review');
    return { request: req };
  }
);

export const toggleVoteWorkshopRequest = createAction(
  z.object({ request_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const idx = db.workshop_request_votes.findIndex(
      (v) => v.request_id === input.request_id && v.user_id === user.id
    );

    let voted = false;
    if (idx !== -1) {
      db.workshop_request_votes.splice(idx, 1);
      voted = false;
    } else {
      db.workshop_request_votes.push({
        request_id: input.request_id,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });
      voted = true;
    }

    revalidatePath('/workshops/request');
    return { voted };
  }
);

export const markAttendance = createAction(
  z.object({
    workshop_id: z.string().uuid(),
    user_id: z.string().uuid(),
    attended: z.boolean(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { db }) => {
    let rsvp = db.workshop_rsvps.find(
      (r) => r.workshop_id === input.workshop_id && r.user_id === input.user_id
    );

    if (!rsvp) {
      rsvp = {
        workshop_id: input.workshop_id,
        user_id: input.user_id,
        attended: input.attended,
        created_at: new Date().toISOString(),
      };
      db.workshop_rsvps.push(rsvp);
    } else {
      rsvp.attended = input.attended;
    }

    revalidatePath('/manage/workshops');
    return { success: true };
  }
);
