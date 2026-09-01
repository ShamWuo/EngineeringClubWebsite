'use server';

import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { adminMemberRoleSchema, adminSettingsSchema } from '@/lib/validation/schemas';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import type { UserRole } from '@/lib/db/types';

export const updateMemberRole = createAction(
  adminMemberRoleSchema,
  { role: 'admin' },
  async (input, { user, db }) => {
    const profile = db.profiles.find((p) => p.id === input.user_id);
    if (!profile) throw new Error('Member not found.');

    const oldRole = profile.role;
    profile.role = input.role as UserRole;
    profile.is_active = input.is_active;
    profile.updated_at = new Date().toISOString();

    db.audit_log.push({
      id: db.audit_log.length + 1,
      actor_id: user.id,
      action: 'update_member_role',
      entity_type: 'profiles',
      entity_id: profile.id,
      diff: { old_role: oldRole, new_role: profile.role, is_active: profile.is_active },
      created_at: new Date().toISOString(),
    });

    safeRevalidatePath('/admin/members');
    return { profile };
  }
);

export const updateClubSettings = createAction(
  adminSettingsSchema,
  { role: 'admin' },
  async (input, { user, db }) => {
    const settings = db.club_settings;
    settings.club_name = input.club_name;
    settings.allowed_email_domain = input.allowed_email_domain;
    settings.budget_ceiling_cents = input.budget_ceiling_cents;
    settings.updated_at = new Date().toISOString();
    settings.updated_by = user.id;

    db.audit_log.push({
      id: db.audit_log.length + 1,
      actor_id: user.id,
      action: 'update_club_settings',
      entity_type: 'club_settings',
      entity_id: 'default',
      diff: input,
      created_at: new Date().toISOString(),
    });

    safeRevalidatePath('/admin/settings');
    safeRevalidatePath('/', 'layout');
    return { settings };
  }
);
