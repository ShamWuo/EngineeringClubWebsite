import React from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { RequestCard } from '@/components/domain/request-card';
import { EmptyState } from '@/components/domain/empty-state';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Inbox,
  Clock,
  CheckCircle2,
  Users,
  Trophy,
  Lightbulb,
  DollarSign,
  Filter,
} from 'lucide-react';

export default async function OfficerReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string }>;
}) {
  await requireRole(['officer', 'admin']);
  const db = getDb();
  const params = await searchParams;
  const kindFilter = params.kind || 'all';
  const statusFilter = params.status || 'pending';

  // Gather requests from all 4 tables
  const teamReqs = db.team_requests.map((r) => ({
    ...r,
    kind: 'team' as const,
    title: r.proposed_name,
    summary: r.purpose,
    amountCents: undefined,
  }));

  const compReqs = db.competition_requests.map((r) => ({
    ...r,
    kind: 'competition' as const,
    title: r.name,
    summary: r.why,
    amountCents: r.estimated_cost_cents,
  }));

  const workshopReqs = db.workshop_requests.map((r) => ({
    ...r,
    kind: 'workshop' as const,
    title: r.topic,
    summary: r.rationale,
    amountCents: undefined,
  }));

  const fundingReqs = db.funding_requests.map((r) => ({
    ...r,
    kind: 'funding' as const,
    title: r.title,
    summary: r.justification,
    amountCents: r.amount_requested_cents,
  }));

  const allRequests = [
    ...teamReqs,
    ...compReqs,
    ...workshopReqs,
    ...fundingReqs,
  ];

  // Counts by kind (pending)
  const pendingTeamCount = teamReqs.filter((r) => r.status === 'pending').length;
  const pendingCompCount = compReqs.filter((r) => r.status === 'pending').length;
  const pendingWorkshopCount = workshopReqs.filter((r) => r.status === 'pending').length;
  const pendingFundingCount = fundingReqs.filter((r) => r.status === 'pending').length;
  const totalPending = pendingTeamCount + pendingCompCount + pendingWorkshopCount + pendingFundingCount;

  // Filter
  let filtered = allRequests;
  if (statusFilter !== 'all') {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }
  if (kindFilter !== 'all') {
    filtered = filtered.filter((r) => r.kind === kindFilter);
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Inbox className="h-6 w-6 text-brand-600" />
              Unified Officer Review Queue
            </h1>
            {totalPending > 0 && (
              <span className="flex h-6 px-2 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                {totalPending} pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Review, approve, or request modifications for new teams, proposed competitions, workshop topics, and project funding.
          </p>
        </div>
      </div>

      {/* Kind Tabs with Pending Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Requests', count: totalPending },
          { id: 'team', label: 'Teams', count: pendingTeamCount },
          { id: 'competition', label: 'Competitions', count: pendingCompCount },
          { id: 'workshop', label: 'Workshops', count: pendingWorkshopCount },
          { id: 'funding', label: 'Funding', count: pendingFundingCount },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/review?kind=${tab.id}&status=${statusFilter}`}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              kindFilter === tab.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-3xs font-bold px-1.5 py-0.2 rounded-full ${
                  kindFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Status Filter Sub-bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium">
          <Filter className="h-3 w-3" /> Status:
        </span>
        {[
          { id: 'pending', label: 'Pending Review' },
          { id: 'changes_requested', label: 'Changes Requested' },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'all', label: 'All Statuses' },
        ].map((st) => (
          <Link
            key={st.id}
            href={`/review?kind=${kindFilter}&status=${st.id}`}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === st.id
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {st.label}
          </Link>
        ))}
      </div>

      {/* Queue Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Requests In This Queue View"
          description="Everything in this category is currently up to date."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req) => {
            const requester = db.profiles.find((p) => p.id === req.requested_by);

            return (
              <RequestCard
                key={req.id}
                id={req.id}
                kind={req.kind}
                title={req.title}
                summary={req.summary}
                status={req.status}
                createdAt={req.created_at}
                requesterName={requester?.full_name || 'Member'}
                requesterEmail={requester?.email}
                amountCents={req.amountCents}
                isOfficerReview={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
