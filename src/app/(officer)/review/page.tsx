import React from 'react';
import Link from 'next/link';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { RequestCard } from '@/components/domain/request-card';
import { EmptyState } from '@/components/domain/empty-state';
import {
  Inbox,
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

  // Gather requests from all 5 tables
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

  const generalReqs = (db.general_requests || []).map((r) => ({
    ...r,
    kind: 'general' as const,
    title: r.title,
    summary: `[Category: ${r.category} | Urgency: ${r.urgency}] ${r.description}`,
    amountCents: undefined,
  }));

  const allRequests = [
    ...teamReqs,
    ...compReqs,
    ...workshopReqs,
    ...fundingReqs,
    ...generalReqs,
  ];

  // Counts by kind (pending)
  const pendingTeamCount = teamReqs.filter((r) => r.status === 'pending').length;
  const pendingCompCount = compReqs.filter((r) => r.status === 'pending').length;
  const pendingWorkshopCount = workshopReqs.filter((r) => r.status === 'pending').length;
  const pendingFundingCount = fundingReqs.filter((r) => r.status === 'pending').length;
  const pendingGeneralCount = generalReqs.filter((r) => r.status === 'pending').length;
  const totalPending = pendingTeamCount + pendingCompCount + pendingWorkshopCount + pendingFundingCount + pendingGeneralCount;

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
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Inbox className="h-6 w-6 text-red-600 dark:text-red-500" />
              Unified Officer Review Queue
            </h1>
            {totalPending > 0 && (
              <span className="flex h-6 px-2.5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs shadow-md shadow-red-950/30">
                {totalPending} pending
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Review and decide proposals across competitions, subteams, workshops, hardware funding, and lab equipment access.
          </p>
        </div>
      </div>

      {/* Kind Tabs with Pending Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'all', label: 'All Requests', count: totalPending },
          { id: 'competition', label: 'Competitions', count: pendingCompCount },
          { id: 'funding', label: 'Funding', count: pendingFundingCount },
          { id: 'team', label: 'Subteams', count: pendingTeamCount },
          { id: 'workshop', label: 'Workshops', count: pendingWorkshopCount },
          { id: 'general', label: 'Equipment / Other', count: pendingGeneralCount },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/review?kind=${tab.id}&status=${statusFilter}`}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              kindFilter === tab.id
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-3xs font-bold px-1.5 py-0.2 rounded-full ${
                  kindFilter === tab.id
                    ? 'bg-black/30 text-white'
                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
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
        <span className="text-zinc-500 flex items-center gap-1 font-medium">
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
            className={`px-2.5 py-1 rounded-md transition-all text-xs ${
              statusFilter === st.id
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold border border-zinc-300 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
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
          description="Everything in this category is currently processed."
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
