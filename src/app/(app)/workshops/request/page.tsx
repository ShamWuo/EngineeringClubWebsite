import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { WorkshopRequestForm } from './request-form';
import { WorkshopVoteBoard } from './vote-board';
import { Lightbulb, ArrowLeft } from 'lucide-react';

export default async function WorkshopRequestPage() {
  const user = await requireUser();
  const db = getDb();

  const requests = db.workshop_requests.filter((r) => r.status === 'pending');
  const votes = db.workshop_request_votes;

  const enrichedRequests = requests.map((req) => {
    const requester = db.profiles.find((p) => p.id === req.requested_by);
    const voteCount = votes.filter((v) => v.request_id === req.id).length;
    const hasVoted = votes.some((v) => v.request_id === req.id && v.user_id === user.id);

    return {
      ...req,
      requesterName: requester?.full_name || requester?.email || 'Unknown',
      voteCount,
      hasVoted,
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to workshops
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          Workshop Topic Requests & Community Demand
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Propose a topic you want to learn or teach, or upvote existing ideas to signal member interest to club officers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic Proposal Form */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
            Propose a Topic
          </h2>
          <WorkshopRequestForm />
        </div>

        {/* Community Demand & Upvoting Board */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
            Member Topic Upvote Board ({enrichedRequests.length})
          </h2>
          <WorkshopVoteBoard requests={enrichedRequests} />
        </div>
      </div>
    </div>
  );
}
