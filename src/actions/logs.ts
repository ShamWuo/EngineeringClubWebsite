'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { workLogSchema } from '@/lib/validation/schemas';
import type { WorkLogVisibility } from '@/lib/db/types';

export const createWorkLog = createAction(
  workLogSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const now = new Date().toISOString();

    const log = {
      id: crypto.randomUUID(),
      author_id: user.id,
      team_id: input.team_id || null,
      competition_id: input.competition_id || null,
      body: input.body,
      hours_spent: input.hours_spent ?? null,
      blockers: input.blockers || null,
      visibility: input.visibility as WorkLogVisibility,
      created_at: now,
      updated_at: now,
    };

    db.work_logs.unshift(log);

    revalidatePath('/logs');
    revalidatePath('/dashboard');
    if (input.team_id) {
      revalidatePath(`/teams/${input.team_id}`);
    }
    return { log };
  }
);

export const deleteWorkLog = createAction(
  z.object({ log_id: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const idx = db.work_logs.findIndex((l) => l.id === input.log_id);
    if (idx === -1) throw new Error('Work log not found.');

    const log = db.work_logs[idx];
    const isOfficer = user.role === 'officer' || user.role === 'admin';
    if (log.author_id !== user.id && !isOfficer) {
      throw new Error('Unauthorized to delete this log entry.');
    }

    db.work_logs.splice(idx, 1);

    revalidatePath('/logs');
    revalidatePath('/dashboard');
    if (log.team_id) {
      revalidatePath(`/teams/${log.team_id}`);
    }
    return { success: true };
  }
);
