'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithEmail, switchDemoUser } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { Cpu, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alex Vance',
    email: 'alex.vance@bvsd.org',
    role: 'Admin',
    description: 'Club President (Full administrative access & settings)',
    badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Maya Lin',
    email: 'maya.lin@bvsd.org',
    role: 'Officer',
    description: 'VP Operations (Review queue, manage comps & workshops)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sam Rivera',
    email: 'sam.rivera@bvsd.org',
    role: 'Member (Lead)',
    description: 'Powertrain Team Lead (Submits requests, leads team)',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Jordan Chen',
    email: 'jordan.chen@bvsd.org',
    role: 'Member',
    description: 'Software Member (Signs up for comps, RSVPs to workshops)',
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleOAuth = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
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

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await loginWithEmail({ email });
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccessMsg(`Welcome, ${res.data.email}! Redirecting to dashboard...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }
    });
  };

  const handlePersonaLogin = (userId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await switchDemoUser({ userId });
      if (!res.ok) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-zinc-50 dark:bg-black transition-colors">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-950/40 mb-2 border border-red-500">
            <Cpu className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Engineering Club Portal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Authenticate using your verified Google student account or campus email.
          </p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 shadow-2xl shadow-red-950/10 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Official Google OAuth Button */}
            <Button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isGoogleLoading || isPending}
              className="w-full h-11 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs gap-3 border border-zinc-300 dark:border-zinc-700 shadow-sm transition-all cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 font-semibold">
                  Or Email Sign In
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  School Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  <Input
                    type="email"
                    required
                    placeholder="student@bvsd.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-red-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold gap-2 text-xs shadow-md shadow-red-950/40 cursor-pointer"
              >
                <span>{isPending ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500 font-semibold">
                  Or Demo Persona Switcher
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePersonaLogin(p.id)}
                  disabled={isPending}
                  className="w-full text-left p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:border-red-500/50 bg-zinc-50/80 hover:bg-red-50/50 dark:bg-zinc-900/60 dark:hover:bg-red-950/20 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 border border-zinc-300 dark:border-zinc-700">
                      {p.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-red-600 dark:group-hover:text-red-400">
                          {p.name}
                        </span>
                        <span className={`text-3xs font-bold px-1.5 py-0.2 rounded border ${p.badgeColor}`}>
                          {p.role}
                        </span>
                      </div>
                      <span className="text-2xs text-zinc-500 line-clamp-1">
                        {p.description}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
