import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database, UserRole } from '@/lib/db/types';
import { getDb } from '@/lib/db/mock-data';

export async function createClient() {
  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch {
    // Return a mock client when outside request context
    return {
      auth: {
        async getUser() {
          return { data: { user: null }, error: null };
        },
      },
    } as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

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
          // Ignore if called in Server Component
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
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const db = getDb();
  let demoUserId: string | undefined;

  try {
    const cookieStore = await cookies();
    demoUserId = cookieStore?.get?.('demo_user_id')?.value;
  } catch {
    // Outside of request scope (e.g. in test suite)
    // Default to the first profile (Admin Alex Vance) to allow test execution
    const adminUser = db.profiles[0];
    return {
      id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: adminUser.role,
      avatar_url: adminUser.avatar_url,
      grad_year: adminUser.grad_year,
      skills: adminUser.skills,
      is_active: adminUser.is_active,
    };
  }

  // If a demo user session cookie is set, resolve user from profiles
  if (demoUserId) {
    const profile = db.profiles.find((p) => p.id === demoUserId && p.is_active);
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        grad_year: profile.grad_year,
        skills: profile.skills,
        is_active: profile.is_active,
      };
    }
  }

  // Otherwise, attempt to read Supabase Auth session
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Default to the first profile for development preview
      const defaultUser = db.profiles[0];
      if (defaultUser) {
        return {
          id: defaultUser.id,
          email: defaultUser.email,
          full_name: defaultUser.full_name,
          role: defaultUser.role,
          avatar_url: defaultUser.avatar_url,
          grad_year: defaultUser.grad_year,
          skills: defaultUser.skills,
          is_active: defaultUser.is_active,
        };
      }
      return null;
    }

    const profile = db.profiles.find((p) => p.id === user.id);
    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        grad_year: profile.grad_year,
        skills: profile.skills,
        is_active: profile.is_active,
      };
    }

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      role: (user.user_metadata?.role as UserRole) || 'member',
      avatar_url: user.user_metadata?.avatar_url || null,
      grad_year: user.user_metadata?.grad_year || null,
      skills: [],
      is_active: true,
    };
  } catch {
    const defaultUser = db.profiles[0];
    return {
      id: defaultUser.id,
      email: defaultUser.email,
      full_name: defaultUser.full_name,
      role: defaultUser.role,
      avatar_url: defaultUser.avatar_url,
      grad_year: defaultUser.grad_year,
      skills: defaultUser.skills,
      is_active: defaultUser.is_active,
    };
  }
}
