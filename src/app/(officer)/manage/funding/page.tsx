import React from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/domain/status-badge';
import { OfficerFundingTable } from './funding-table';
import { DollarSign, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default async function ManageFundingPage() {
  await requireRole(['officer', 'admin']);
  const db = getDb();

  const fundingRequests = db.funding_requests;
  const lineItems = db.funding_line_items;
  const profiles = db.profiles;
  const teams = db.teams;
  const competitions = db.competitions;
  const ceilingCents = db.club_settings.budget_ceiling_cents;

  const totalRequestedCents = fundingRequests.reduce((s, f) => s + f.amount_requested_cents, 0);
  const totalApprovedCents = fundingRequests.reduce((s, f) => s + (f.amount_approved_cents || 0), 0);
  const totalReimbursedCents = fundingRequests
    .filter((f) => f.status === 'reimbursed')
    .reduce((s, f) => s + (f.amount_approved_cents || 0), 0);

  const budgetUsagePercent = ceilingCents > 0 ? (totalApprovedCents / ceilingCents) * 100 : 0;
  const isBudgetWarning = budgetUsagePercent >= 80;

  const enrichedRequests = fundingRequests.map((req) => {
    const requester = profiles.find((p) => p.id === req.requested_by);
    const team = teams.find((t) => t.id === req.team_id);
    const comp = competitions.find((c) => c.id === req.competition_id);
    const items = lineItems.filter((i) => i.funding_request_id === req.id);

    return {
      ...req,
      requesterName: requester?.full_name || requester?.email || 'Unknown',
      requesterEmail: requester?.email || '',
      teamName: team?.name || null,
      compName: comp?.name || null,
      lineItemsCount: items.length,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Club Funding & Spend Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor budget burn, adjust approved allocations, mark reimbursements, and export financial audit reports.
          </p>
        </div>

        <a href="/api/export/funding.csv" download="club-funding-spend-report.csv">
          <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 shadow-xs">
            <Download className="h-4 w-4" />
            Export Spend Report (.csv)
          </Button>
        </a>
      </div>

      {/* Budget Metrics Card with Ceiling Warning */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500">Annual Budget Ceiling</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ${(ceilingCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500">Total Requested</div>
          <div className="text-xl font-bold text-brand-600 mt-1">
            ${(totalRequestedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
          <div className="text-xs text-emerald-700 dark:text-emerald-300">Approved Allocations</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${(totalApprovedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
          <div className="text-xs text-purple-700 dark:text-purple-300">Reimbursed Disbursed</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            ${(totalReimbursedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </div>

      {/* Budget Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span>Budget Capacity Utilization</span>
          <span className={isBudgetWarning ? 'text-amber-600 font-bold' : 'text-slate-600'}>
            {budgetUsagePercent.toFixed(1)}% of ${(ceilingCents / 100).toLocaleString()} ceiling
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isBudgetWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
        {isBudgetWarning && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>Warning: Approved funding has exceeded 80% of the annual budget ceiling.</span>
          </div>
        )}
      </Card>

      {/* Interactive Table with Reimbursement Marking */}
      <OfficerFundingTable requests={enrichedRequests} />
    </div>
  );
}
