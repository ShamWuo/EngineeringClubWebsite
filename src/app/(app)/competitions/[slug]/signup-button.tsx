'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { signupForCompetition, cancelCompetitionSignup } from '@/actions/competitions';
import { CheckCircle2, UserCheck, X } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type SignupRow = Database['public']['Tables']['competition_signups']['Row'];

export function CompetitionSignupButton({
  competitionId,
  initialSignup,
}: {
  competitionId: string;
  initialSignup?: SignupRow;
}) {
  const [signup, setSignup] = useState<SignupRow | undefined>(initialSignup);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(initialSignup?.note || '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signupForCompetition({
        competition_id: competitionId,
        note: note.trim() || null,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setSignup(res.data.signup);
        setShowNoteInput(false);
      }
    });
  };

  const handleCancel = () => {
    if (!confirm('Cancel your competition signup interest?')) return;
    setError(null);
    startTransition(async () => {
      const res = await cancelCompetitionSignup({
        competition_id: competitionId,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setSignup(undefined);
        setNote('');
      }
    });
  };

  if (signup) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Signed Up ({signup.status})</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
            className="h-6 text-2xs text-red-500 hover:text-red-700 p-1"
          >
            Cancel
          </Button>
        </div>
        {signup.note && (
          <p className="text-2xs text-slate-500 italic">
            Note: "{signup.note}"
          </p>
        )}
      </div>
    );
  }

  if (showNoteInput) {
    return (
      <form onSubmit={handleSignup} className="space-y-2.5">
        {error && <div className="text-2xs text-red-600 font-medium">{error}</div>}
        <label className="block text-2xs font-semibold text-slate-600 dark:text-slate-400">
          Subsystem Interest & Skills Note (Optional)
        </label>
        <Textarea
          rows={2}
          placeholder="e.g. Interested in CFD aero simulation, telemetry firmware, or motor drive PCB..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="text-xs"
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNoteInput(false)}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="h-7 text-xs font-semibold"
          >
            {isPending ? 'Submitting...' : 'Confirm Registration'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      onClick={() => setShowNoteInput(true)}
      size="sm"
      className="w-full font-semibold text-xs gap-1.5"
    >
      <UserCheck className="h-4 w-4" />
      Express Interest / Sign Up
    </Button>
  );
}
