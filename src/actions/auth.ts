'use server';

import { cookies } from 'next/headers';
import { safeRevalidatePath } from '@/lib/actions/safe-revalidate';
import { z } from 'zod';
import { createAction } from '@/lib/actions/action-wrapper';
import { loginSchema, profileUpdateSchema, onboardingSchema } from '@/lib/validation/schemas';
import { createClient } from '@/lib/supabase/server';

export const loginWithEmail = createAction(
  loginSchema,
  { requireAuth: false },
  async (input, { db, supabase }) => {
    const email = input.email.trim().toLowerCase();
    const settings = db.club_settings;
    const domain = settings.allowed_email_domain;

    // Look up existing profile in memory
    let profile = db.profiles.find((p) => p.email === email);

    // If not in local mock DB, check remote Supabase profiles
    if (!profile && supabase) {
      try {
        const { data: remoteProfile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('email', email)
          .single();

        if (remoteProfile) {
          db.profiles.push(remoteProfile);
          profile = remoteProfile;
        }
      } catch {}
    }

    // If new user, enforce allowed email domain (e.g. bvsd.org)
    if (!profile && domain && !email.endsWith(`@${domain}`) && !email.endsWith('@bvsd.org') && !email.endsWith('@gmail.com')) {
      throw new Error(`Email must belong to the @${domain} domain.`);
    }

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
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(profile);
    }

    if (supabase) {
      try {
        await (supabase.from('profiles') as any).upsert({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
          is_active: true,
          onboarding_completed: profile.onboarding_completed ?? false,
        });
      } catch (err) {
        console.error('Supabase profile sync error:', err);
      }
    }

    try {
      const cookieStore = await cookies();
      cookieStore.set('session_user_id', profile.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
      cookieStore.set('demo_user_id', profile.id, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {}

    safeRevalidatePath('/', 'layout');
    return { userId: profile.id, email: profile.email, role: profile.role };
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
      cookieStore.delete('session_user_id');
      cookieStore.delete('demo_user_id');
    } catch {}

    safeRevalidatePath('/', 'layout');
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

    safeRevalidatePath('/dashboard');
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

    safeRevalidatePath('/dashboard');
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

    safeRevalidatePath('/dashboard');
    return { success: true };
  }
);

export const completeOnboarding = createAction(
  onboardingSchema,
  { requireAuth: true },
  async (input, { user, supabase, db }) => {
    const now = new Date().toISOString();

    const notificationTitle = 'Welcome to Fairview High School Engineering! 🚀';
    const compCount = input.interested_competition_ids?.length || 0;
    let notificationBody = 'Your profile is complete. Explore active competitions, submit requests, and RSVP for workshops.';
    if (input.subteam_interest) {
      notificationBody = `Your profile is complete with interest in ${input.subteam_interest}. Join us in Room 604 on Tuesdays & Thursdays after school!`;
    } else if (compCount > 0) {
      notificationBody = `Your profile is complete with ${input.skills.length} engineering disciplines and interest in ${compCount} upcoming competition${compCount > 1 ? 's' : ''}. Welcome aboard!`;
    }

    if (supabase) {
      try {
        await (supabase.from('profiles') as any)
          .update({
            full_name: input.full_name,
            grad_year: input.grad_year,
            skills: input.skills,
            onboarding_completed: true,
            updated_at: now,
          })
          .eq('id', user.id);

        // Record competition interest signups in Supabase
        if (input.interested_competition_ids && input.interested_competition_ids.length > 0) {
          for (const compId of input.interested_competition_ids) {
            const { data: existing } = await (supabase.from('competition_signups') as any)
              .select('id')
              .eq('competition_id', compId)
              .eq('user_id', user.id)
              .single();

            if (!existing) {
              await (supabase.from('competition_signups') as any).insert({
                id: crypto.randomUUID(),
                competition_id: compId,
                user_id: user.id,
                note: 'Expressed interest during onboarding',
                status: 'pending',
                created_at: now,
                updated_at: now,
              });
            }
          }
        }

        // Insert welcome/update notification into remote Supabase
        await (supabase.from('notifications') as any).insert({
          user_id: user.id,
          kind: 'welcome',
          title: notificationTitle,
          body: notificationBody,
          href: '/dashboard',
        });
      } catch (err) {
        console.error('completeOnboarding Supabase sync error:', err);
      }
    }

    // Record signups in mock db
    if (input.interested_competition_ids && input.interested_competition_ids.length > 0) {
      for (const compId of input.interested_competition_ids) {
        const existingSignup = db.competition_signups.find(
          (s) => s.competition_id === compId && s.user_id === user.id
        );
        if (!existingSignup) {
          db.competition_signups.push({
            id: crypto.randomUUID(),
            competition_id: compId,
            user_id: user.id,
            note: 'Expressed interest during onboarding',
            status: 'pending',
            created_at: now,
            updated_at: now,
          });
        }
      }
    }

    let profile = db.profiles.find((p) => p.id === user.id);
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        full_name: input.full_name,
        grad_year: input.grad_year,
        role: user.role,
        skills: input.skills,
        avatar_url: user.avatar_url,
        is_active: true,
        onboarding_completed: true,
        created_at: now,
        updated_at: now,
      };
      db.profiles.push(profile);
    } else {
      profile.full_name = input.full_name;
      profile.grad_year = input.grad_year;
      profile.skills = input.skills;
      profile.onboarding_completed = true;
      profile.updated_at = now;
    }

    // Insert notification in mock db
    db.notifications.unshift({
      id: crypto.randomUUID(),
      user_id: user.id,
      kind: 'welcome',
      title: notificationTitle,
      body: notificationBody,
      href: '/dashboard',
      read_at: null,
      created_at: now,
    });

    safeRevalidatePath('/', 'layout');
    safeRevalidatePath('/dashboard');
    safeRevalidatePath('/onboarding');
    safeRevalidatePath('/competitions');
    safeRevalidatePath('/admin/members');
    return { success: true, onboardingCompleted: true };
  }
);
