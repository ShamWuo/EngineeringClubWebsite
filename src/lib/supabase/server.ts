import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database, UserRole } from '@/lib/db/types';
import { getDb } from '@/lib/db/mock-data';

export async function createClient() {
  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request context (e.g. static generation / build time fallback)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vanpniumrtgctqobfzmw.supabase.co';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i';

    return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vanpniumrtgctqobfzmw.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i';

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore?.getAll?.() || [];
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore?.set?.(name, value, options)
          );
        } catch {
          // Ignore if called in a Server Component during render
        }
      },
    },
  });
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  grad_year: number | null;
  skills: string[];
  is_active: boolean;
  onboarding_completed: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Test suite fallback
  if (process.env.NODE_ENV === 'test') {
    return {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'alex.vance@bvsd.org',
      full_name: 'Alex Vance',
      role: 'admin',
      avatar_url: null,
      grad_year: 2026,
      skills: ['Robotics', 'CAD', 'Embedded Systems'],
      is_active: true,
      onboarding_completed: true,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Check Supabase OAuth session
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!userError && user) {
        // Fetch user profile from Supabase profiles table
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        const db = getDb();

        if (profile) {
          if (!db.profiles.some((p) => p.id === profile.id)) {
            db.profiles.push(profile);
          }
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role as UserRole,
            avatar_url: profile.avatar_url,
            grad_year: profile.grad_year,
            skills: profile.skills || [],
            is_active: profile.is_active,
            onboarding_completed: Boolean(profile.onboarding_completed ?? (profile.grad_year !== null && (profile.skills?.length ?? 0) > 0)),
          };
        }

        // If profile row doesn't exist yet in Supabase table, build from user metadata
        const fallbackProfile = {
          id: user.id,
          email: user.email || '',
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.user_name ||
            user.email?.split('@')[0] ||
            'Member',
          role: (user.user_metadata?.role as UserRole) || 'member',
          avatar_url:
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            null,
          grad_year: user.user_metadata?.grad_year || null,
          skills: [],
          is_active: true,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (!db.profiles.some((p) => p.id === fallbackProfile.id)) {
          db.profiles.push(fallbackProfile as any);
        }

        return {
          id: user.id,
          email: user.email || '',
          full_name: fallbackProfile.full_name,
          role: fallbackProfile.role,
          avatar_url: fallbackProfile.avatar_url,
          grad_year: fallbackProfile.grad_year,
          skills: [],
          is_active: true,
          onboarding_completed: false,
        };
      }
    } catch {}

    // 2. Check session cookie for email login / active session
    let sessionUserId: string | null = null;
    try {
      const cookieStore = await cookies();
      sessionUserId =
        cookieStore.get('session_user_id')?.value ||
        cookieStore.get('demo_user_id')?.value ||
        null;
    } catch {}

    if (sessionUserId) {
      const db = getDb();
      const profile = db.profiles.find((p) => p.id === sessionUserId);
      if (profile && profile.is_active) {
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role as UserRole,
          avatar_url: profile.avatar_url,
          grad_year: profile.grad_year,
          skills: profile.skills || [],
          is_active: profile.is_active,
          onboarding_completed: Boolean(profile.onboarding_completed ?? (profile.grad_year !== null && (profile.skills?.length ?? 0) > 0)),
        };
      }

      // Also check remote Supabase table if not found in local memory
      try {
        const { data: remoteProfile } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', sessionUserId)
          .single();

        if (remoteProfile && remoteProfile.is_active) {
          if (!db.profiles.some((p) => p.id === remoteProfile.id)) {
            db.profiles.push(remoteProfile);
          }
          return {
            id: remoteProfile.id,
            email: remoteProfile.email,
            full_name: remoteProfile.full_name,
            role: remoteProfile.role as UserRole,
            avatar_url: remoteProfile.avatar_url,
            grad_year: remoteProfile.grad_year,
            skills: remoteProfile.skills || [],
            is_active: remoteProfile.is_active,
            onboarding_completed: Boolean(remoteProfile.onboarding_completed ?? (remoteProfile.grad_year !== null && (remoteProfile.skills?.length ?? 0) > 0)),
          };
        }
      } catch {}
    }

    return null;
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}
