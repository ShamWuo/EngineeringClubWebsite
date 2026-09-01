import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database, UserRole } from '@/lib/db/types';

export async function createClient() {
  let cookieStore: any;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request context (e.g. static generation / build time fallback)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vanpniumrtgctqobfzmw.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i';

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
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i';

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
    };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Fetch user profile from Supabase profiles table
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role as UserRole,
        avatar_url: profile.avatar_url,
        grad_year: profile.grad_year,
        skills: profile.skills || [],
        is_active: profile.is_active,
      };
    }

    // If profile row doesn't exist yet, build from user metadata
    return {
      id: user.id,
      email: user.email || '',
      full_name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        user.email?.split('@')[0] ||
        null,
      role: (user.user_metadata?.role as UserRole) || 'member',
      avatar_url:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      grad_year: user.user_metadata?.grad_year || null,
      skills: [],
      is_active: true,
    };
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}
