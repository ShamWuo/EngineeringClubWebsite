import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './status-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Users, Trophy, Lightbulb, HelpCircle } from 'lucide-react';

interface RequestCardProps {
  id: string;
  kind: 'team' | 'competition' | 'workshop' | 'funding' | 'general';
  title: string;
  summary: string | null;
  status: string;
  createdAt: string;
  requesterName?: string;
  requesterEmail?: string;
  amountCents?: number;
  isOfficerReview?: boolean;
}

export function RequestCard({
  id,
  kind,
  title,
  summary,
  status,
  createdAt,
  requesterName,
  requesterEmail,
  amountCents,
  isOfficerReview = false,
}: RequestCardProps) {
  const getKindIcon = () => {
    switch (kind) {
      case 'team':
        return <Users className="h-4 w-4 text-red-400" />;
      case 'competition':
        return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'workshop':
        return <Lightbulb className="h-4 w-4 text-emerald-400" />;
      case 'funding':
        return <DollarSign className="h-4 w-4 text-purple-400" />;
      case 'general':
        return <HelpCircle className="h-4 w-4 text-zinc-300" />;
    }
  };

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="hover:border-zinc-700 bg-zinc-950 border-zinc-850 transition-all flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-3xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            {getKindIcon()}
            <span>{kind} Request</span>
          </div>
          <StatusBadge status={status} />
        </div>
        <CardTitle className="text-sm font-bold leading-snug line-clamp-1 text-white">{title}</CardTitle>
        {requesterName && (
          <CardDescription className="text-3xs text-zinc-500">
            Proposed by <span className="font-medium text-zinc-300">{requesterName}</span> ({requesterEmail}) • {formattedDate}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="py-0 flex-1">
        {summary && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}
        {amountCents !== undefined && (
          <div className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-900/60 px-2.5 py-1 rounded inline-block mb-3">
            Requested: ${(amountCents / 100).toFixed(2)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-zinc-850 flex justify-between items-center text-xs">
        <span className="text-zinc-600 text-3xs font-mono">{id.substring(0, 8)}...</span>
        {isOfficerReview ? (
          <Link href={`/review/${kind}/${id}`}>
            <Button size="sm" className="h-7 text-3xs gap-1 bg-red-600 hover:bg-red-700 text-white font-bold">
              Review Action
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <span className="text-zinc-500 text-3xs">Submitted {formattedDate}</span>
        )}
      </CardFooter>
    </Card>
  );
}
