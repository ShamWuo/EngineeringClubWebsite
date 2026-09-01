'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { reviewRequestAction } from '@/actions/review';
import { CheckCircle2, XCircle, AlertTriangle, Send } from 'lucide-react';

export function ReviewDecisionForm({
  kind,
  requestId,
  currentStatus,
  requestedAmountCents,
}: {
  kind: 'team' | 'competition' | 'workshop' | 'funding';
  requestId: string;
  currentStatus: string;
  requestedAmountCents?: number;
}) {
  const router = useRouter();
  const [decision, setDecision] = useState<'approve' | 'reject' | 'changes_requested'>('approve');
  const [note, setNote] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(
    requestedAmountCents ? (requestedAmountCents / 100).toFixed(2) : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await reviewRequestAction({
        kind,
        requestId,
        decision,
        note: note.trim() || null,
        fundingApprovedAmountCents:
          kind === 'funding' && decision === 'approve'
            ? Math.round(parseFloat(approvedAmount || '0') * 100)
            : undefined,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        router.push('/review');
      }
    });
  };

  return (
    <Card className="border-brand-200 dark:border-brand-900 sticky top-20 shadow-md">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Officer Action Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Decision
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('approve')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'approve'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mb-1 text-emerald-600" />
                <span>Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('changes_requested')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'changes_requested'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mb-1 text-amber-600" />
                <span>Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('reject')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'reject'
                    ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-950/60 dark:text-red-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <XCircle className="h-4 w-4 mb-1 text-red-600" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {kind === 'funding' && decision === 'approve' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approved Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="text-xs"
              />
              <span className="text-3xs text-slate-500 mt-1 block">
                Requested: ${((requestedAmountCents || 0) / 100).toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Feedback / Decision Note
            </label>
            <Textarea
              rows={3}
              placeholder="e.g. Approved in full. Please submit receipts to finance upon order delivery..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs"
            />
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            disabled={isPending}
            className={`w-full font-bold text-xs gap-1.5 ${
              decision === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : decision === 'reject'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {isPending
              ? 'Processing...'
              : `Execute ${decision.replace('_', ' ').toUpperCase()}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
