'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';
import { ClubLogo } from '@/components/domain/club-logo';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    // Check for error parameters in URL (from OAuth provider or callback route)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      const errorDesc = params.get('error_description');
      if (urlError || errorDesc) {
        setError(decodeURIComponent(errorDesc || urlError || 'Authentication failed.'));
      }
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const rawNext = new URLSearchParams(window.location.search).get('next');
        const target =
          rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/'
            ? rawNext
            : '/dashboard';
        router.replace(target);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const rawNext = new URLSearchParams(window.location.search).get('next');
        const target =
          rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/'
            ? rawNext
            : '/dashboard';
        router.replace(target);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleOAuth = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const params = new URLSearchParams(window.location.search);
      const rawNext = params.get('next');
      const safeNext =
        rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && rawNext !== '/'
          ? rawNext
          : '/dashboard';

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign in.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors overflow-hidden">
      {/* Ambient background grid & lighting */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <ClubLogo className="h-16 w-16" size={64} priority />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Knights Member Portal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Authenticate using your verified Fairview Google account (@bvsd.org) to access squad rosters, funding grants, and workshops.
          </p>
        </div>

        <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-xl shadow-zinc-950/5 dark:shadow-red-950/10 backdrop-blur-xl rounded-2xl">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Official Google OAuth Button */}
            <Button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isGoogleLoading}
              className="w-full h-12 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-white font-bold text-sm gap-3 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all cursor-pointer rounded-xl"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
