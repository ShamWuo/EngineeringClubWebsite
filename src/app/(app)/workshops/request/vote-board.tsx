'use client';

import React, { useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleVoteWorkshopRequest } from '@/actions/workshops';
import { ThumbsUp } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type WorkshopReq = Database['public']['Tables']['workshop_requests']['Row'] & {
  requesterName: string;
  voteCount: number;
  hasVoted: boolean;
};

export function WorkshopVoteBoard({ requests }: { requests: WorkshopReq[] }) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (requestId: string) => {
    startTransition(async () => {
      await toggleVoteWorkshopRequest({ request_id: requestId });
    });
  };

  if (requests.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-zinc-500 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850">
        No active topic proposals yet. Be the first to suggest one!
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Card
          key={req.id}
          className="p-4 flex items-start justify-between gap-4 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs transition-colors"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {req.topic}
              </h3>
              {req.offering_to_teach && (
                <Badge variant="purple" className="text-3xs py-0">
                  Instructor Volunteer
                </Badge>
              )}
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {req.rationale}
            </p>

            <div className="flex items-center gap-3 text-3xs text-zinc-400 pt-1">
              <span>Proposed by {req.requesterName}</span>
              {req.preferred_timeframe && (
                <span>• Preferred: {req.preferred_timeframe}</span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant={req.hasVoted ? 'default' : 'outline'}
            onClick={() => handleVote(req.id)}
            disabled={isPending}
            className={`flex flex-col items-center justify-center h-12 w-14 p-0 shrink-0 ${
              req.hasVoted ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${req.hasVoted ? 'fill-current' : ''}`} />
            <span className="text-2xs font-bold mt-0.5">{req.voteCount}</span>
          </Button>
        </Card>
      ))}
    </div>
  );
}
