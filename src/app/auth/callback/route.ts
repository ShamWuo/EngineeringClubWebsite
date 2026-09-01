import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/dashboard';

  if (error) {
    console.error('OAuth error from provider:', error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    try {
      const supabase: any = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('OAuth exchangeCodeForSession error:', exchangeError);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
      }

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
          null;

        // Ensure user profile exists in profiles table
        const { data: existingProfile } = await (supabase.from('profiles') as any)
          .select('id, role')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          // Check if first user
          const { count } = await (supabase.from('profiles') as any)
            .select('*', { count: 'exact', head: true });

          const initialRole = count === 0 ? 'admin' : 'member';

          await (supabase.from('profiles') as any).insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            role: initialRole,
            avatar_url: avatarUrl,
            skills: [],
            is_active: true,
          });

          // Insert welcome notification
          await (supabase.from('notifications') as any).insert({
            user_id: user.id,
            kind: 'welcome',
            title: 'Welcome to Fairview High School Engineering! 🚀',
            body: 'Your account is active. Explore active competitions, submit requests, and RSVP for workshops.',
            href: '/competitions',
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    } catch (err: any) {
      console.error('OAuth callback handler exception:', err);
      return NextResponse.redirect(`${origin}/login?error=oauth_exception`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_auth_code`);
}
