import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getCompetitions, getTeams } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { ImpactBadge, IMPACT_LABEL, IMPACT_DESCRIPTION, IMPACT_ORDER } from '@/components/domain/impact-badge';
import { Trophy, Plus, Users, Calendar, ArrowRight, Search, Globe, Sparkles, Clock, DollarSign } from 'lucide-react';
import type { ImpactLevel } from '@/lib/db/types';

type CompetitionWithTeams = Awaited<ReturnType<typeof getCompetitions>>[number];

const IMPACT_TABS: { id: ImpactLevel | 'all'; label: string }[] = [
  { id: 'all', label: 'All Impact Levels' },
  { id: 'world', label: '🌍 World' },
  { id: 'national', label: '⭐ National' },
  { id: 'regional', label: '📍 Regional' },
  { id: 'local', label: '🏠 Local' },
];

function buildImpactHref(impact: ImpactLevel | 'all', sort: string, query: string) {
  const params = new URLSearchParams();
  if (impact !== 'all') params.set('impact', impact);
  if (sort && sort !== 'impact') params.set('sort', sort);
  if (query) params.set('q', query);
  const qs = params.toString();
  return `/competitions${qs ? `?${qs}` : ''}`;
}

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ impact?: string; status?: string; q?: string; sort?: string }>;
}) {
  await requireUser();
  const [competitionsData, teamsData, params] = await Promise.all([
    getCompetitions(),
    getTeams(),
    searchParams,
  ]);

  const impactFilter = (params.impact || 'all') as ImpactLevel | 'all';
  const statusFilter = params.status || 'all';
  const searchQuery = (params.q || '').trim().toLowerCase();
  const sortMode = params.sort || 'impact';

  let competitions = competitionsData;

  // Impact level filter (primary facet)
  if (impactFilter !== 'all') {
    competitions = competitions.filter((c) => c.impact_level === impactFilter);
  }

  // Secondary status filter (kept for backward compatibility)
  if (statusFilter !== 'all') {
    competitions = competitions.filter((c) => c.status === statusFilter);
  }

  // Full-text search across name, organizer, and description
  if (searchQuery) {
    competitions = competitions.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery) ||
        (c.organizer || '').toLowerCase().includes(searchQuery) ||
        (c.description || '').toLowerCase().includes(searchQuery)
    );
  }

  // Sorting
  const now = Date.now();
  const sorted = [...competitions].sort((a, b) => {
    if (sortMode === 'impact') {
      // Primary: impact ascending (world first), secondary: event date ascending
      const impactDelta = IMPACT_ORDER[a.impact_level] - IMPACT_ORDER[b.impact_level];
      if (impactDelta !== 0) return impactDelta;
      return (new Date(a.event_starts_at || '2999-01-01').getTime()) - (new Date(b.event_starts_at || '2999-01-01').getTime());
    }
    if (sortMode === 'deadline') {
      // Next actionable deadline first (registration close > event start)
      const next = (c: CompetitionWithTeams) => {
        const closes = c.registration_closes_at ? new Date(c.registration_closes_at).getTime() : null;
        const starts = c.event_starts_at ? new Date(c.event_starts_at).getTime() : null;
        const futureCloses = closes && closes > now ? closes : null;
        const futureStarts = starts && starts > now ? starts : null;
        return futureCloses ?? futureStarts ?? new Date('2999-01-01').getTime();
      };
      return next(a) - next(b);
    }
    if (sortMode === 'event') {
      return (new Date(a.event_starts_at || '2999-01-01').getTime()) - (new Date(b.event_starts_at || '2999-01-01').getTime());
    }
    return 0;
  });

  // Count per impact level for tab badges (pre-filter counts)
  const impactCounts = competitionsData.reduce<Record<string, number>>((acc, c) => {
    acc[c.impact_level] = (acc[c.impact_level] || 0) + 1;
    return acc;
  }, {});
  impactCounts.all = competitionsData.length;

  const hasFilters = impactFilter !== 'all' || statusFilter !== 'all' || !!searchQuery;

  const daysUntil = (iso: string | null) => {
    if (!iso) return null;
    return Math.ceil((new Date(iso).getTime() - now) / 86400000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-red-600 dark:text-red-500" />
            Engineering Competitions
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {impactFilter === 'all'
              ? 'Every competition the club tracks, from in-house design sprints to world championships.'
              : IMPACT_DESCRIPTION[impactFilter]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/requests/new?type=competition">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 shadow-md shadow-red-950/40 text-xs">
              <Plus className="h-4 w-4" />
              Propose New Competition
            </Button>
          </Link>
        </div>
      </div>

      {/* Impact Level Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
          {IMPACT_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={buildImpactHref(tab.id, sortMode, params.q || '')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                impactFilter === tab.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-md text-3xs font-mono font-bold ${
                  impactFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {impactCounts[tab.id] ?? 0}
              </span>
            </Link>
          ))}
        </div>

        {/* Search & Sort bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <form action="/competitions" method="GET" className="relative flex-1">
            {impactFilter !== 'all' && <input type="hidden" name="impact" value={impactFilter} />}
            {sortMode !== 'impact' && <input type="hidden" name="sort" value={sortMode} />}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search competitions, organizers, or technologies (e.g. rocketry, CAD, cybersecurity)…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500"
            />
          </form>

          <div className="flex items-center gap-1.5 text-2xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold uppercase tracking-wide">Sort</span>
            {[
              { id: 'impact', label: 'Impact' },
              { id: 'deadline', label: 'Next Deadline' },
              { id: 'event', label: 'Event Date' },
            ].map((s) => (
              <Link
                key={s.id}
                href={buildImpactHref(impactFilter, s.id, params.q || '')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  sortMode === s.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Active filter summary */}
        {hasFilters && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-2xs text-zinc-500 dark:text-zinc-400">
              Showing {sorted.length} of {competitionsData.length} competitions
            </p>
            <Link
              href="/competitions"
              className="text-2xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </div>

      {/* Competitions Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No competitions match</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Try a different impact level or clear your search. You can also propose a competition for officers to review.
          </p>
          <Link href="/requests/new?type=competition">
            <Button size="sm">Propose a Competition</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((comp) => {
            const compTeams = teamsData.filter((t) => t.competition_id === comp.id);
            const totalMembers = compTeams.reduce((acc, t) => acc + (t.memberCount || 0), 0);
            const regCloseDays = daysUntil(comp.registration_closes_at);
            const eventDays = daysUntil(comp.event_starts_at);
            const spotsLeft = comp.max_teams ? Math.max(comp.max_teams - compTeams.length, 0) : null;
            const isRegistrationOpen =
              comp.status !== 'completed' &&
              comp.status !== 'cancelled' &&
              (!comp.registration_opens_at || new Date(comp.registration_opens_at).getTime() <= now) &&
              (!comp.registration_closes_at || new Date(comp.registration_closes_at).getTime() >= now);

            return (
              <Card
                key={comp.id}
                className="flex flex-col justify-between hover:border-red-500/50 dark:hover:border-red-600/50 bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800 transition-all shadow-xs hover:shadow-md rounded-2xl"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <ImpactBadge level={comp.impact_level} className="text-3xs" />
                    <StatusBadge status={comp.status} className="text-3xs" />
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 leading-snug text-zinc-900 dark:text-white">
                    {comp.name}
                  </CardTitle>
                  {comp.organizer && (
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {comp.organizer}
                    </span>
                  )}
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mt-2 leading-relaxed">
                    {comp.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {/* Registration status banner */}
                  {isRegistrationOpen ? (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-2xs">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      Registration open{regCloseDays !== null && regCloseDays <= 45 ? ` — closes in ${regCloseDays} day${regCloseDays !== 1 ? 's' : ''}` : ''}
                    </div>
                  ) : regCloseDays !== null && regCloseDays < 0 && comp.status !== 'completed' && comp.status !== 'cancelled' ? (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold text-2xs">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Registration closed
                    </div>
                  ) : null}

                  {/* Urgent deadline callout */}
                  {eventDays !== null && eventDays >= 0 && eventDays <= 30 && comp.status === 'active' && (
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-amber-700 dark:text-amber-400">
                      <Calendar className="h-3.5 w-3.5" />
                      Event in {eventDays} day{eventDays !== 1 ? 's' : ''}!
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-300">
                      <Users className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                      {compTeams.length} Team{compTeams.length !== 1 ? 's' : ''} ({totalMembers} member{totalMembers !== 1 ? 's' : ''})
                    </span>
                    {comp.event_starts_at && (
                      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        {new Date(comp.event_starts_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-2xs">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-zinc-400" />
                      {IMPACT_LABEL[comp.impact_level] || comp.impact_level}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-zinc-400" />
                      {comp.entry_fee_cents ? `$${(comp.entry_fee_cents / 100).toFixed(0)}/team` : 'Free'}
                      {spotsLeft !== null && (
                        <span className="text-zinc-400 dark:text-zinc-500">· {spotsLeft} club spot{spotsLeft !== 1 ? 's' : ''} left</span>
                      )}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2">
                  <Link href={`/competitions/${comp.slug}`} className="w-full">
                    <Button size="sm" className="w-full text-xs font-bold gap-1 bg-red-600 hover:bg-red-700 text-white">
                      View Details & Teams
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
