'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resetMemberOnboarding } from '@/actions/admin';
import { Sparkles, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export function AdminOnboardingCard({ currentAdminId }: { currentAdminId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleResetStatus = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await resetMemberOnboarding({ user_id: currentAdminId });
      if (!res.ok) {
        alert(res.error);
      } else {
        setMessage('Your orientation status has been reset to incomplete. The dashboard orientation banner is now active.');
      }
    });
  };

  return (
    <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
              Member Onboarding & Orientation Flow
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Administrators have full clearance to replay and redo the member onboarding wizard at any time.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {message && (
          <div className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Admin Clearance Guaranteed</span>
          </div>
          <p>
            Re-running the orientation wizard allows you to update your engineering disciplines, test the 4-step student onboarding workflow, and re-sign makerspace safety protocols. Your administrative role is completely preserved.
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetStatus}
          disabled={isPending}
          className="text-xs font-semibold gap-1.5 border-zinc-200 dark:border-zinc-800 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {isPending ? 'Resetting...' : 'Reset My Status to Incomplete'}
        </Button>

        <Link href="/onboarding">
          <Button
            type="button"
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Launch & Redo Onboarding</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
