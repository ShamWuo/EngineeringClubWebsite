'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { loginSchema, profileUpdateSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';

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

    try {
      const cookieStore = await cookies();
      cookieStore.set('demo_user_id', profile.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {}

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

    try {
      const cookieStore = await cookies();
      cookieStore.set('demo_user_id', profile.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {}

    revalidatePath('/', 'layout');
    return { userId: profile.id, role: profile.role, name: profile.full_name };
  }
);

export const signOut = createAction(
  z.object({}),
  { requireAuth: false },
  async (_, { supabase }) => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }

    try {
      const cookieStore = await cookies();
      cookieStore.delete('demo_user_id');
    } catch {}

    revalidatePath('/', 'layout');
    return { success: true };
  }
);

export const updateProfile = createAction(
  profileUpdateSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase
        .from('profiles')
        .update({
          full_name: input.full_name,
          grad_year: input.grad_year ?? null,
          skills: input.skills,
          avatar_url: input.avatar_url || null,
          updated_at: now,
        })
        .eq('id', user.id);
    }

    const profile = db.profiles.find((p) => p.id === user.id);
    if (profile) {
      profile.full_name = input.full_name;
      profile.grad_year = input.grad_year ?? null;
      profile.skills = input.skills;
      if (input.avatar_url !== undefined) {
        profile.avatar_url = input.avatar_url || null;
      }
      profile.updated_at = now;
    }

    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const markNotificationRead = createAction(
  z.object({ notificationId: z.string().uuid() }),
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', input.notificationId)
        .eq('user_id', user.id);
    }

    const notif = db.notifications.find((n) => n.id === input.notificationId && n.user_id === user.id);
    if (notif) {
      notif.read_at = now;
    }

    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const markAllNotificationsRead = createAction(
  z.object({}),
  { requireAuth: true },
  async (_, { user, supabase, db }) => {
    const now = new Date().toISOString();

    if (supabase) {
      await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('user_id', user.id)
        .is('read_at', null);
    }

    db.notifications.forEach((n) => {
      if (n.user_id === user.id && !n.read_at) {
        n.read_at = now;
      }
    });

    revalidatePath('/dashboard');
    return { success: true };
  }
);
