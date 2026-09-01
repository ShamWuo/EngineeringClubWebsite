'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/domain/status-badge';
import { markFundingReimbursed } from '@/actions/funding';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type FundingReqRow = Database['public']['Tables']['funding_requests']['Row'] & {
  requesterName: string;
  requesterEmail: string;
  teamName: string | null;
  compName: string | null;
  lineItemsCount: number;
};

export function OfficerFundingTable({ requests }: { requests: FundingReqRow[] }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkReimbursed = (requestId: string, title: string) => {
    if (!confirm(`Mark "${title}" as disbursed & reimbursed?`)) return;
    startTransition(async () => {
      await markFundingReimbursed({ request_id: requestId });
    });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b text-2xs uppercase text-slate-500 font-semibold">
          <tr>
            <th className="py-3 px-4">Request / Subteam</th>
            <th className="py-3 px-4">Requester</th>
            <th className="py-3 px-4 text-right">Requested</th>
            <th className="py-3 px-4 text-right">Approved</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
              <td className="py-3 px-4">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {req.title}
                </div>
                <div className="text-3xs text-slate-400">
                  {req.teamName || 'No Team'} {req.compName ? `• ${req.compName}` : ''}
                </div>
              </td>

              <td className="py-3 px-4">
                <div className="font-medium text-slate-800 dark:text-slate-200">{req.requesterName}</div>
                <div className="text-3xs text-slate-400">{req.requesterEmail}</div>
              </td>

              <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                ${(req.amount_requested_cents / 100).toFixed(2)}
              </td>

              <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                {req.amount_approved_cents ? `$${(req.amount_approved_cents / 100).toFixed(2)}` : '—'}
              </td>

              <td className="py-3 px-4 text-center">
                <StatusBadge status={req.status} className="text-3xs" />
              </td>

              <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                {req.status === 'approved' || req.status === 'partially_approved' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkReimbursed(req.id, req.title)}
                    disabled={isPending}
                    className="h-7 text-2xs gap-1 text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark Reimbursed
                  </Button>
                ) : null}

                <Link href={`/review/funding/${req.id}`}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                    Review <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
