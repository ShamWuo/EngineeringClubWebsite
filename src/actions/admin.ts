'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { adminSettingsSchema } from '@/lib/validation/schemas';
import type { UserRole } from '@/lib/db/types';

export const updateMemberRole = createAction(
  z.object({
    user_id: z.string().uuid(),
    role: z.enum(['member', 'officer', 'admin']),
    is_active: z.boolean().optional(),
  }),
  { role: 'admin' },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      const updateData: any = {
        role: input.role,
        updated_at: now,
      };
      if (input.is_active !== undefined) {
        updateData.is_active = input.is_active;
      }
      await supabase.from('profiles').update(updateData).eq('id', input.user_id);
    }

    const member = db.profiles.find((p) => p.id === input.user_id);
    if (member) {
      member.role = input.role as UserRole;
      if (input.is_active !== undefined) {
        member.is_active = input.is_active;
      }
      member.updated_at = now;
    }

    safeRevalidatePath('/admin/members');
    return { success: true, profile: member || { id: input.user_id, role: input.role, email: 'member' } };
  }
);

export const updateClubSettings = createAction(
  adminSettingsSchema,
  { role: 'admin' },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase
        .from('club_settings')
        .update({
          club_name: input.club_name,
          allowed_email_domain: input.allowed_email_domain,
          budget_ceiling_cents: input.budget_ceiling_cents,
          updated_at: now,
          updated_by: user.id,
        })
        .eq('id', 'default');
    }

    db.club_settings.club_name = input.club_name;
    db.club_settings.allowed_email_domain = input.allowed_email_domain;
    db.club_settings.budget_ceiling_cents = input.budget_ceiling_cents;
    db.club_settings.updated_at = now;
    db.club_settings.updated_by = user.id;

    safeRevalidatePath('/admin/settings');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/');
    return { success: true };
  }
);
