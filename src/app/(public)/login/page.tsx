'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginWithEmail, switchDemoUser } from '@/actions/auth';
import { Cpu, Mail, ArrowRight, Shield, CheckCircle2, Sparkles, User } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alex Vance',
    email: 'alex.vance@university.edu',
    role: 'Admin',
    description: 'Club President (Full administrative access & settings)',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Maya Lin',
    email: 'maya.lin@university.edu',
    role: 'Officer',
    description: 'VP Operations (Review queue, manage comps & workshops)',
    badgeColor: 'bg-brand-100 text-brand-700 border-brand-200',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sam Rivera',
    email: 'sam.rivera@university.edu',
    role: 'Member (Lead)',
    description: 'Powertrain Team Lead (Submits funding, logs work, leads team)',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Jordan Chen',
    email: 'jordan.chen@university.edu',
    role: 'Member',
    description: 'Software Member (Signs up for comps, RSVPs to workshops)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md mb-2">
            <Cpu className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Sign In to Engineering Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use your official school email address (<code className="text-brand-600 font-semibold">@university.edu</code>).
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  School Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full font-bold gap-2"
              >
                <span>{isPending ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-2xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or Instant Demo Persona
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
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                      {p.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-brand-600">
                          {p.name}
                        </span>
                        <span className={`text-3xs font-bold px-1.5 py-0.2 rounded border ${p.badgeColor}`}>
                          {p.role}
                        </span>
                      </div>
                      <span className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {p.description}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
