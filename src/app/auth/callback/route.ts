import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db/mock-data';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const rawNext = searchParams.get('next');

  // Calculate base redirect origin considering load balancers / reverse proxies
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseOrigin = !isLocalEnv && forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;

  if (error) {
    console.error('OAuth error from provider:', error, errorDescription);
    return NextResponse.redirect(`${baseOrigin}/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    try {
      const supabase: any = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('OAuth exchangeCodeForSession error:', exchangeError);
        return NextResponse.redirect(`${baseOrigin}/login?error=${encodeURIComponent(exchangeError.message)}`);
      }

      // Ensure 'next' parameter is a safe relative path and NEVER defaults to the landing page ('/')
      const safeNext =
        rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/'
          ? rawNext
          : '/dashboard';

      let destination = safeNext;
      let role = 'member';
      let userIsFirstTime = false;

      if (data?.user) {
        const user = data.user;
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.user_name ||
          user.email?.split('@')[0] ||
          'FHS Engineer';

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email || user.id}`;

        // Ensure user profile exists in profiles table
        try {
          const { data: existingProfile } = await (supabase.from('profiles') as any)
            .select('id, role, onboarding_completed')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            userIsFirstTime = true;
            // Check if first user
            const { count } = await (supabase.from('profiles') as any)
              .select('*', { count: 'exact', head: true });

            role = count === 0 ? 'admin' : 'member';

            await (supabase.from('profiles') as any).insert({
              id: user.id,
              email: user.email!,
              full_name: fullName,
              role,
              avatar_url: avatarUrl,
              skills: [],
              is_active: true,
              onboarding_completed: false,
            });

            // Insert welcome notification
            await (supabase.from('notifications') as any).insert({
              user_id: user.id,
              kind: 'welcome',
              title: 'Welcome to Fairview High School Engineering! 🚀',
              body: 'Your account is active. Complete your onboarding to unlock squad rosters and lab access.',
              href: '/onboarding',
            });
          } else {
            role = existingProfile.role;
            if (!existingProfile.onboarding_completed) {
              userIsFirstTime = true;
            }
          }
        } catch (dbErr) {
          console.error('Supabase profile sync error:', dbErr);
        }

        // First-time users see the prominent orientation banner directly in /dashboard
        // and can access /onboarding at any time.

        // Sync into mock DB for in-memory access
        const db = getDb();
        const existingInMemory = db.profiles.find((p) => p.id === user.id || (user.email && p.email === user.email));
        if (!existingInMemory) {
          db.profiles.push({
            id: user.id,
            email: user.email || '',
            full_name: fullName,
            role: role as any,
            avatar_url: avatarUrl,
            grad_year: new Date().getFullYear() + 2,
            skills: [],
            is_active: true,
            onboarding_completed: !userIsFirstTime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          existingInMemory.role = role as any;
          if (fullName) existingInMemory.full_name = fullName;
          if (avatarUrl) existingInMemory.avatar_url = avatarUrl;
        }
      }

      // Final safeguard: destination must ALWAYS be /dashboard or an authorized relative path, NEVER '/'
      if (!destination || destination === '/' || destination.trim() === '') {
        destination = '/dashboard';
      }

      const redirectUrl = `${baseOrigin}${destination}`;
      const response = NextResponse.redirect(redirectUrl);

      if (data?.user) {
        // Set session cookies on response for SSR fallbacks
        response.cookies.set('session_user_id', data.user.id, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        });

        // Mirror cookieStore cookies onto response to guarantee session persistence across SSR environments
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          cookieStore.set('session_user_id', data.user.id, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          });

          for (const c of cookieStore.getAll()) {
            response.cookies.set(c.name, c.value, c as any);
          }
        } catch {}
      }

      return response;
    } catch (err: any) {
      console.error('OAuth callback handler exception:', err);
      return NextResponse.redirect(`${baseOrigin}/login?error=oauth_exception`);
    }
  }

  return NextResponse.redirect(`${baseOrigin}/login?error=no_auth_code`);
}
