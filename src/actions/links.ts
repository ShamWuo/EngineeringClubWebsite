'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { linkSchema } from '@/lib/validation/schemas';
import type { LinkTier } from '@/lib/db/types';

export const upsertLink = createAction(
  linkSchema.extend({
    id: z.string().uuid().optional(),
  }),
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    // Check primary cap (max 4 active primary links)
    if (input.tier === 'primary' && input.is_active) {
      if (supabase) {
        const { count } = await supabase
          .from('links')
          .select('*', { count: 'exact', head: true })
          .eq('tier', 'primary')
          .eq('is_active', true)
          .neq('id', input.id || '00000000-0000-0000-0000-000000000000');

        if ((count || 0) >= 4) {
          throw new Error('A maximum of 4 primary links are allowed at one time to maintain visual hierarchy.');
        }
      }

      const activePrimaryCount = db.links.filter(
        (l) => l.tier === 'primary' && l.is_active && l.id !== input.id
      ).length;

      if (activePrimaryCount >= 4) {
        throw new Error('A maximum of 4 primary links are allowed at one time to maintain visual hierarchy.');
      }
    }

    if (input.id) {
      if (supabase) {
        await supabase
          .from('links')
          .update({
            label: input.label,
            url: input.url,
            description: input.description || null,
            tier: input.tier as LinkTier,
            icon: input.icon || null,
            sort_order: input.sort_order ?? 0,
            is_active: input.is_active ?? true,
            updated_by: user.id,
            updated_at: now,
          })
          .eq('id', input.id);
      }

      const link = db.links.find((l) => l.id === input.id);
      if (link) {
        link.label = input.label;
        link.url = input.url;
        link.description = input.description || null;
        link.tier = input.tier as LinkTier;
        link.icon = input.icon || null;
        link.sort_order = input.sort_order ?? link.sort_order;
        link.is_active = input.is_active ?? link.is_active;
        link.updated_by = user.id;
        link.updated_at = now;
      }

      safeRevalidatePath('/links');
      safeRevalidatePath('/manage/links');
      safeRevalidatePath('/dashboard');
      return { link: link || { id: input.id, ...input } };
    } else {
      const newLinkId = crypto.randomUUID();
      const newLink = {
        id: newLinkId,
        label: input.label,
        url: input.url,
        description: input.description || null,
        tier: input.tier as LinkTier,
        icon: input.icon || 'Link2',
        sort_order: input.sort_order ?? (db.links.length + 1),
        is_active: input.is_active ?? true,
        updated_by: user.id,
        updated_at: now,
      };

      if (supabase) {
        await supabase.from('links').insert(newLink);
      }

      db.links.push(newLink);
      safeRevalidatePath('/links');
      safeRevalidatePath('/manage/links');
      safeRevalidatePath('/dashboard');
      return { link: newLink };
    }
  }
);

export const deleteLink = createAction(
  z.object({ id: z.string().uuid() }),
  { role: ['officer', 'admin'] },
  async (input, { user, supabase, db }) => {
    if (supabase) {
      await supabase.from('links').delete().eq('id', input.id);
    }

    const idx = db.links.findIndex((l) => l.id === input.id);
    if (idx !== -1) {
      db.links.splice(idx, 1);
    }

    safeRevalidatePath('/links');
    safeRevalidatePath('/manage/links');
    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);
