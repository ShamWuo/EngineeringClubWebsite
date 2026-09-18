import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Flag,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import type { Database } from '@/lib/db/types';

type CompetitionRow = Database['public']['Tables']['competitions']['Row'];

interface Milestone {
  id: string;
  competitionId: string;
  competitionName: string;
  competitionSlug: string;
  status: string;
  organizer: string | null;
  type: 'deadline' | 'event' | 'open';
  label: string;
  date: Date;
  daysRemaining: number;
}

interface CompetitionDeadlineTimelineProps {
  competitions: CompetitionRow[];
  maxItems?: number;
}

function getDaysRemaining(targetDate: Date): number {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number): { text: string; urgent: boolean } {
  if (days < 0) {
    return { text: 'Closed', urgent: false };
  }
  if (days === 0) {
    return { text: 'Due Today', urgent: true };
  }
  if (days === 1) {
    return { text: 'Tomorrow', urgent: true };
  }
  if (days <= 7) {
    return { text: `${days} days left`, urgent: true };
  }
  if (days <= 30) {
    return { text: `${days} days left`, urgent: false };
  }
  const months = Math.round(days / 30);
  return { text: `In ${months} mo`, urgent: false };
}

export function CompetitionDeadlineTimeline({
  competitions,
  maxItems = 6,
}: CompetitionDeadlineTimelineProps) {
  // Extract milestones from competitions
  const milestones: Milestone[] = [];

  competitions.forEach((comp) => {
    // 1. Registration deadline (most critical)
    if (comp.registration_closes_at) {
      const regDate = new Date(comp.registration_closes_at);
      const days = getDaysRemaining(regDate);
      milestones.push({
        id: `${comp.id}-reg-close`,
        competitionId: comp.id,
        competitionName: comp.name,
        competitionSlug: comp.slug,
        status: comp.status,
        organizer: comp.organizer,
        type: 'deadline',
        label: 'Registration Deadline',
        date: regDate,
        daysRemaining: days,
      });
    }

    // 2. Competition event start
    if (comp.event_starts_at) {
      const eventDate = new Date(comp.event_starts_at);
      const days = getDaysRemaining(eventDate);
      milestones.push({
        id: `${comp.id}-event-start`,
        competitionId: comp.id,
        competitionName: comp.name,
        competitionSlug: comp.slug,
        status: comp.status,
        organizer: comp.organizer,
        type: 'event',
        label: 'Competition Finals / Event',
        date: eventDate,
        daysRemaining: days,
      });
    }
  });

  // Sort chronologically (earliest deadline first)
  const sortedMilestones = milestones
    .filter((m) => m.daysRemaining >= -7) // Show upcoming or very recent
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, maxItems);

  if (sortedMilestones.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-2">
        <AlertCircle className="h-6 w-6 text-zinc-400 mx-auto" />
        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          No upcoming competition deadlines scheduled.
        </p>
        <p className="text-3xs text-zinc-500">
          Check back once registration opens for national engineering events.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
      {sortedMilestones.map((m) => {
        const { text: countdownText, urgent } = formatCountdown(m.daysRemaining);

        return (
          <div key={m.id} className="relative group">
            {/* Solid Marker Node */}
            <div
              className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white dark:bg-zinc-950 ${
                m.type === 'deadline'
                  ? urgent
                    ? 'border-red-600 text-red-600'
                    : 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {m.type === 'deadline' ? (
                <Clock className="h-2.5 w-2.5" />
              ) : (
                <Flag className="h-2.5 w-2.5" />
              )}
            </div>

            {/* Content Card */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center text-3xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      m.type === 'deadline'
                        ? urgent
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-900'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-900'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {m.label}
                  </span>

                  <span className="text-3xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {m.date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <Badge
                  variant={urgent ? 'destructive' : 'secondary'}
                  className="text-3xs font-mono font-bold"
                >
                  {countdownText}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/competitions/${m.competitionSlug}`}
                    className="font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 group-hover:underline truncate"
                  >
                    <span>{m.competitionName}</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0 opacity-70" />
                  </Link>
                  {m.organizer && (
                    <p className="text-3xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {m.organizer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
