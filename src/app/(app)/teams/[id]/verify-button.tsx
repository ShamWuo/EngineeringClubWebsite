'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { verifyTeamAction } from '@/actions/teams';
import { ShieldCheck, Loader2 } from 'lucide-react';

export function VerifyTeamButton({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const res = await verifyTeamAction({ team_id: teamId });
      if (!res.ok) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        onClick={handleVerify}
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 gap-1.5 shadow-sm"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        {isPending ? 'Verifying...' : 'Verify Team'}
      </Button>
      {error && <span className="text-3xs text-red-500">{error}</span>}
    </div>
  );
}
