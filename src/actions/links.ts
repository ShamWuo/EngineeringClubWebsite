'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { linkSchema } from '@/lib/validation/schemas';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import type { LinkTier } from '@/lib/db/types';

export const upsertLink = createAction(
  linkSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();

    // Check primary cap (max 4 active primary links)
    if (input.tier === 'primary' && input.is_active) {
      const activePrimaryCount = db.links.filter(
        (l) => l.tier === 'primary' && l.is_active && l.id !== input.id
      ).length;

      if (activePrimaryCount >= 4) {
        throw new Error('A maximum of 4 primary links are allowed at one time to maintain visual hierarchy.');
      }
    }

    if (input.id) {
      const link = db.links.find((l) => l.id === input.id);
      if (!link) throw new Error('Link not found.');

      link.label = input.label;
      link.url = input.url;
      link.description = input.description || null;
      link.tier = input.tier as LinkTier;
      link.icon = input.icon || null;
      link.sort_order = input.sort_order ?? link.sort_order;
      link.is_active = input.is_active ?? true;
      link.updated_by = user.id;
      link.updated_at = now;

      safeRevalidatePath('/links');
      safeRevalidatePath('/dashboard');
      safeRevalidatePath('/manage/links');
      return { link };
    } else {
      const newLink = {
        id: crypto.randomUUID(),
        label: input.label,
        url: input.url,
        description: input.description || null,
        tier: input.tier as LinkTier,
        icon: input.icon || null,
        sort_order: input.sort_order ?? (db.links.length + 1),
        is_active: input.is_active ?? true,
        updated_by: user.id,
        updated_at: now,
      };

      db.links.push(newLink);

      safeRevalidatePath('/links');
      safeRevalidatePath('/dashboard');
      safeRevalidatePath('/manage/links');
      return { link: newLink };
    }
  }
);

export const deleteLink = createAction(
  z.object({ id: z.string().uuid() }),
  { role: ['officer', 'admin'] },
  async (input, { db }) => {
    const idx = db.links.findIndex((l) => l.id === input.id);
    if (idx === -1) throw new Error('Link not found.');

    db.links.splice(idx, 1);

    safeRevalidatePath('/links');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/manage/links');
    return { success: true };
  }
);

export const reorderLinks = createAction(
  z.object({
    link_orders: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, db }) => {
    const now = new Date().toISOString();
    input.link_orders.forEach(({ id, sort_order }) => {
      const link = db.links.find((l) => l.id === id);
      if (link) {
        link.sort_order = sort_order;
        link.updated_by = user.id;
        link.updated_at = now;
      }
    });

    safeRevalidatePath('/links');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/manage/links');
    return { success: true };
  }
);
