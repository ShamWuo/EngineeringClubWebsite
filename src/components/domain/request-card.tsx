import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './status-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Users, Trophy, Lightbulb } from 'lucide-react';

interface RequestCardProps {
  id: string;
  kind: 'team' | 'competition' | 'workshop' | 'funding';
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
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'competition':
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case 'workshop':
        return <Lightbulb className="h-4 w-4 text-purple-500" />;
      case 'funding':
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
    }
  };

  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {getKindIcon()}
            <span>{kind} Request</span>
          </div>
          <StatusBadge status={status} />
        </div>
        <CardTitle className="text-base font-semibold leading-snug line-clamp-1">{title}</CardTitle>
        {requesterName && (
          <CardDescription className="text-xs">
            Proposed by <span className="font-medium text-slate-700 dark:text-slate-300">{requesterName}</span> ({requesterEmail}) • {formattedDate}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="py-0 flex-1">
        {summary && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {summary}
          </p>
        )}
        {amountCents !== undefined && (
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded inline-block mb-3">
            Requested: ${(amountCents / 100).toFixed(2)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400 text-2xs">{id.substring(0, 8)}...</span>
        {isOfficerReview ? (
          <Link href={`/review/${kind}/${id}`}>
            <Button size="sm" variant="default" className="h-7 text-xs gap-1">
              Review Action
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <span className="text-slate-500 text-xs">Submitted {formattedDate}</span>
        )}
      </CardFooter>
    </Card>
  );
}
