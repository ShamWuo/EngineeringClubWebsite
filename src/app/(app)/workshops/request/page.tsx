import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfiles } from '@/lib/db/queries';
import { WorkshopRequestForm } from './request-form';
import { WorkshopVoteBoard } from './vote-board';
import { Lightbulb, ArrowLeft } from 'lucide-react';

export default async function WorkshopRequestPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: requests }, { data: votes }, profiles] = await Promise.all([
    (supabase.from('workshop_requests') as any).select('*').eq('status', 'pending'),
    (supabase.from('workshop_request_votes') as any).select('*'),
    getAdminProfiles(),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const allVotes = votes || [];

  const enrichedRequests = (requests || []).map((req: any) => {
    const requester = profileMap.get(req.requested_by);
    const voteCount = allVotes.filter((v: any) => v.request_id === req.id).length;
    const hasVoted = allVotes.some((v: any) => v.request_id === req.id && v.user_id === user.id);

    return {
      ...req,
      requesterName: requester?.full_name || requester?.email || 'FHS Student',
      voteCount,
      hasVoted,
    };
  }).sort((a: any, b: any) => b.voteCount - a.voteCount);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to workshops
        </Link>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          Workshop Topic Requests & Community Demand
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Propose a topic you want to learn or teach, or upvote existing ideas to signal member interest to club officers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic Proposal Form */}
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
            Propose a Topic
          </h2>
          <WorkshopRequestForm />
        </div>

        {/* Community Demand & Upvoting Board */}
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3">
            Member Topic Upvote Board ({enrichedRequests.length})
          </h2>
          <WorkshopVoteBoard requests={enrichedRequests} />
        </div>
      </div>
    </div>
  );
}
