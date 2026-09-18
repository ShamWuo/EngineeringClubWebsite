import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  ArrowRight,
  ChevronRight,
  CalendarCheck,
  Wrench,
  Trophy,
  AlertCircle,
  MapPin,
  Clock,
} from 'lucide-react';
import type { Database } from '@/lib/db/types';

type CompetitionRow = Database['public']['Tables']['competitions']['Row'];
type WorkshopRow = Database['public']['Tables']['workshops']['Row'];

export interface ClubEvent {
  id: string;
  title: string;
  subtitle?: string;
  timeLabel?: string;
  date: Date;
  location?: string;
  category: 'workshop' | 'competition' | 'deadline';
  categoryLabel: string;
  href: string;
  status?: string;
}

interface UpcomingEventsListProps {
  competitions?: CompetitionRow[];
  workshops?: WorkshopRow[];
  maxItems?: number;
}

function getDaysRemaining(targetDate: Date): number {
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function UpcomingEventsList({
  competitions = [],
  workshops = [],
  maxItems = 6,
}: UpcomingEventsListProps) {
  const now = new Date();
  const events: ClubEvent[] = [];

  // 1. Club Workshops & Lab Sessions (First priority: real interactive events)
  workshops.forEach((ws) => {
    if (ws.status === 'scheduled' && ws.starts_at) {
      const d = new Date(ws.starts_at);
      const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      events.push({
        id: `ws-${ws.id}`,
        title: ws.title,
        subtitle: ws.location || 'FHS Makerspace Lab',
        timeLabel: timeStr,
        date: d,
        location: ws.location || 'FHS Makerspace',
        category: 'workshop',
        categoryLabel: 'Workshop',
        href: `/workshops/${ws.slug}`,
        status: ws.status,
      });
    }
  });

  // 2. Competition Events, Match Days & Hackathons
  competitions.forEach((comp) => {
    if (comp.event_starts_at) {
      const d = new Date(comp.event_starts_at);
      events.push({
        id: `comp-${comp.id}`,
        title: comp.name,
        subtitle: comp.organizer || 'Main Tournament / Competition',
        timeLabel: 'Tournament',
        date: d,
        location: comp.organizer || 'Competition Venue',
        category: 'competition',
        categoryLabel: 'Competition',
        href: `/competitions/${comp.slug}`,
        status: comp.status,
      });
    }

    // 3. Urgent Registration Deadlines (Only closing within 14 days)
    if (comp.registration_closes_at) {
      const d = new Date(comp.registration_closes_at);
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 14) {
        events.push({
          id: `deadline-${comp.id}`,
          title: comp.name,
          subtitle: 'Registration Closes',
          timeLabel: 'Deadline',
          date: d,
          location: 'Online Registration',
          category: 'deadline',
          categoryLabel: 'Deadline',
          href: `/competitions/${comp.slug}`,
          status: comp.status,
        });
      }
    }
  });

  // Filter for upcoming (within last 2 hours or future) and sort chronologically
  const upcomingEvents = events
    .filter((e) => e.date.getTime() >= now.getTime() - 2 * 3600000)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, maxItems);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-red-600 dark:text-red-500" />
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">Upcoming Events</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workshops">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Workshops <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-1.5 shadow-2xs">
          <CalendarCheck className="h-6 w-6 text-zinc-400 mx-auto" />
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No upcoming events scheduled.
          </p>
          <p className="text-3xs text-zinc-500">
            Check back soon for workshop announcements and competition kickoffs.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {upcomingEvents.map((evt) => {
            const daysRemaining = getDaysRemaining(evt.date);
            const isDeadline = evt.category === 'deadline';
            const isWorkshop = evt.category === 'workshop';
            const isCompetition = evt.category === 'competition';
            const isUrgent = isDeadline && daysRemaining <= 7 && daysRemaining >= 0;

            const monthStr = evt.date.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
            const dayNum = evt.date.getDate();

            let countdownBadge = `${daysRemaining}d left`;
            if (daysRemaining === 0) countdownBadge = 'Today';
            if (daysRemaining === 1) countdownBadge = 'Tomorrow';
            if (daysRemaining < 0) countdownBadge = 'Past';

            return (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-2xs group flex items-start gap-3.5"
              >
                {/* Solid Date Block */}
                <div
                  className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg shrink-0 border ${
                    isUrgent
                      ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                      : isWorkshop
                      ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <span className="text-3xs font-mono font-bold leading-none">{monthStr}</span>
                  <span className="text-base font-black leading-tight">{dayNum}</span>
                </div>

                {/* Event Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <span
                      className={`text-3xs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border inline-flex items-center gap-1 ${
                        isDeadline
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-900'
                          : isWorkshop
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-900'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      {isWorkshop && <Wrench className="h-2.5 w-2.5" />}
                      {isCompetition && <Trophy className="h-2.5 w-2.5" />}
                      {isDeadline && <AlertCircle className="h-2.5 w-2.5" />}
                      {evt.categoryLabel}
                    </span>
                    <Badge
                      variant={isUrgent ? 'destructive' : 'secondary'}
                      className="text-3xs font-mono font-bold px-1.5 py-0"
                    >
                      {countdownBadge}
                    </Badge>
                  </div>

                  <Link
                    href={evt.href}
                    className="block font-bold text-xs text-zinc-900 dark:text-zinc-100 hover:text-red-600 dark:hover:text-red-400 truncate leading-snug"
                  >
                    {evt.title}
                  </Link>

                  <div className="flex items-center justify-between text-3xs text-zinc-500 dark:text-zinc-400 mt-1">
                    <span className="truncate flex items-center gap-1">
                      {isWorkshop && <Clock className="h-3 w-3 text-zinc-400 shrink-0" />}
                      {evt.subtitle}
                    </span>
                    <Link
                      href={evt.href}
                      className="text-red-600 dark:text-red-400 font-medium inline-flex items-center gap-0.5 hover:underline shrink-0 ml-2"
                    >
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
