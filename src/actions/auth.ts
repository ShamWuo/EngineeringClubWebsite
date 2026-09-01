'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { loginSchema, profileUpdateSchema } from '@/lib/validation/schemas';
import { getDb } from '@/lib/db/mock-data';

export const loginWithEmail = createAction(
  loginSchema,
  { requireAuth: false },
  async (input, { db }) => {
    const email = input.email.trim().toLowerCase();
    const settings = db.club_settings;
    const domain = settings.allowed_email_domain;

    // Check email domain
    if (domain && !email.endsWith(`@${domain}`)) {
      throw new Error(`Email must belong to the @${domain} domain.`);
    }

    // Lookup or create profile
    let profile = db.profiles.find((p) => p.email === email);
    if (!profile) {
      const isFirst = db.profiles.length === 0;
      profile = {
        id: crypto.randomUUID(),
        email,
        full_name: email.split('@')[0],
        grad_year: new Date().getFullYear() + 2,
        role: isFirst ? 'admin' : 'member',
        skills: [],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }

    const cookieStore = await cookies();
    cookieStore.set('demo_user_id', profile.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath('/', 'layout');
    return { userId: profile.id, email: profile.email, role: profile.role };
  }
);

export const switchDemoUser = createAction(
  z.object({ userId: z.string().uuid() }),
  { requireAuth: false },
  async (input, { db }) => {
    const profile = db.profiles.find((p) => p.id === input.userId && p.is_active);
    if (!profile) {
      throw new Error('User not found or deactivated.');
    }

    const cookieStore = await cookies();
    cookieStore.set('demo_user_id', profile.id, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    revalidatePath('/', 'layout');
    return { userId: profile.id, role: profile.role, name: profile.full_name };
  }
);

export const signOut = createAction(
  z.object({}),
  { requireAuth: false },
  async () => {
    const cookieStore = await cookies();
    cookieStore.delete('demo_user_id');
    revalidatePath('/', 'layout');
    return { success: true };
  }
);

export const updateProfile = createAction(
  profileUpdateSchema,
  { requireAuth: true },
  async (input, { user, db }) => {
    const profile = db.profiles.find((p) => p.id === user.id);
    if (!profile) throw new Error('Profile not found.');

    profile.full_name = input.full_name;
    profile.grad_year = input.grad_year ?? null;
    profile.skills = input.skills;
    if (input.avatar_url !== undefined) {
      profile.avatar_url = input.avatar_url || null;
    }
    profile.updated_at = new Date().toISOString();

    revalidatePath('/me');
    revalidatePath('/dashboard');
    return { profile };
  }
);

export const markNotificationRead = createAction(
  z.object({ notificationId: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, db }) => {
    const notif = db.notifications.find((n) => n.id === input.notificationId && n.user_id === user.id);
    if (notif) {
      notif.read_at = new Date().toISOString();
    }
    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const markAllNotificationsRead = createAction(
  z.object({}),
  { requireAuth: true },
  async (_, { user, db }) => {
    const now = new Date().toISOString();
    db.notifications.forEach((n) => {
      if (n.user_id === user.id && !n.read_at) {
        n.read_at = now;
      }
    });
    revalidatePath('/dashboard');
    return { success: true };
  }
);
