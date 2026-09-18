import React, { Suspense } from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getCompetitions, getTeams } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImpactBadge, IMPACT_LABEL, IMPACT_DESCRIPTION, IMPACT_ORDER } from '@/components/domain/impact-badge';
import { CompetitionFilters } from '@/components/domain/competition-filters';
import { getCompetitionDisciplines } from '@/lib/constants/competitions';
import { Trophy, Plus, Users, Calendar, ArrowRight, Search, Globe, Sparkles, DollarSign, ExternalLink } from 'lucide-react';
import type { ImpactLevel } from '@/lib/db/types';

type CompetitionWithTeams = Awaited<ReturnType<typeof getCompetitions>>[number];

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ impact?: string; discipline?: string; q?: string; sort?: string }>;
}) {
  await requireUser();
  const [competitionsData, teamsData, resolvedParams] = await Promise.all([
    getCompetitions(),
    getTeams(),
    searchParams ? searchParams : Promise.resolve({} as { impact?: string; discipline?: string; q?: string; sort?: string }),
  ]);

  const params = resolvedParams || {};
  const impactFilter = (params.impact || 'all') as ImpactLevel | 'all';
  const disciplineFilter = params.discipline || 'all';
  const searchQuery = (params.q || '').trim().toLowerCase();
  // By default sort by how many people are doing the competition
  const sortMode = params.sort || 'people';

  const now = Date.now();

  // 1. Remove expired and closed registration competitions
  const openCompetitions = competitionsData.filter((c) => {
    // Filter out completed or cancelled
    if (c.status === 'completed' || c.status === 'cancelled') {
      return false;
    }
    // Filter out closed registrations
    if (c.registration_closes_at && new Date(c.registration_closes_at).getTime() < now) {
      return false;
    }
    // Filter out expired events
    if (c.event_ends_at && new Date(c.event_ends_at).getTime() < now) {
      return false;
    }
    if (!c.event_ends_at && c.event_starts_at && new Date(c.event_starts_at).getTime() < now) {
      return false;
    }
    return true;
  });

  let competitions = openCompetitions;

  // 2. Impact level filter dropdown
  if (impactFilter !== 'all') {
    competitions = competitions.filter((c) => c.impact_level === impactFilter);
  }

  // 3. Engineering discipline filter dropdown
  if (disciplineFilter !== 'all') {
    competitions = competitions.filter((c) => {
      const disciplines = getCompetitionDisciplines(c);
      return disciplines.includes(disciplineFilter as any);
    });
  }

  // 4. Full-text search across name, organizer, description, and disciplines
  if (searchQuery) {
    competitions = competitions.filter((c) => {
      const disciplines = getCompetitionDisciplines(c);
      return (
        c.name.toLowerCase().includes(searchQuery) ||
        (c.organizer || '').toLowerCase().includes(searchQuery) ||
        (c.description || '').toLowerCase().includes(searchQuery) ||
        disciplines.some((d) => d.toLowerCase().includes(searchQuery))
      );
    });
  }

  // Helper to calculate participant count
  const getParticipantCount = (compId: string) => {
    const compTeams = teamsData.filter((t) => t.competition_id === compId);
    return compTeams.reduce((acc, t) => acc + (t.memberCount || 0), 0);
  };

  // 5. Sorting
  const sorted = [...competitions].sort((a, b) => {
    if (sortMode === 'people') {
      // Primary: most participants first
      const countA = getParticipantCount(a.id);
      const countB = getParticipantCount(b.id);
      if (countB !== countA) return countB - countA;

      // Secondary: impact ascending (world first), then event date
      const deltaA = IMPACT_ORDER[a.impact_level] ?? 99;
      const deltaB = IMPACT_ORDER[b.impact_level] ?? 99;
      const impactDelta = deltaA - deltaB;
      if (impactDelta !== 0) return impactDelta;
      return (new Date(a.event_starts_at || '2999-01-01').getTime()) - (new Date(b.event_starts_at || '2999-01-01').getTime());
    }
    if (sortMode === 'impact') {
      // Primary: impact ascending (world first), secondary: event date ascending
      const deltaA = IMPACT_ORDER[a.impact_level] ?? 99;
      const deltaB = IMPACT_ORDER[b.impact_level] ?? 99;
      const impactDelta = deltaA - deltaB;
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
              ? 'Active and upcoming engineering challenges, sorted by student participation.'
              : (IMPACT_DESCRIPTION[impactFilter] || 'Competitions filtered by level.')}
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

      {/* Filter Toolbar: Impact Level, Engineering Discipline, Search & Sort */}
      <Suspense fallback={<div className="h-9 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />}>
        <CompetitionFilters
          currentImpact={impactFilter}
          currentDiscipline={disciplineFilter}
          currentSort={sortMode}
          currentQuery={params.q || ''}
          totalCount={openCompetitions.length}
          filteredCount={sorted.length}
        />
      </Suspense>

      {/* Competitions Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No competitions match</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-4">
            Try adjusting your discipline or impact level filter, or propose a new competition for the club.
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
            const disciplines = getCompetitionDisciplines(comp);
            const isRegistrationOpen =
              (!comp.registration_opens_at || new Date(comp.registration_opens_at).getTime() <= now) &&
              (!comp.registration_closes_at || new Date(comp.registration_closes_at).getTime() >= now);

            return (
              <Card
                key={comp.id}
                className="relative group flex flex-col justify-between hover:border-red-500/50 dark:hover:border-red-600/50 bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800 transition-all shadow-xs hover:shadow-md rounded-2xl cursor-pointer"
              >
                {/* Clickable card target to go to details */}
                <Link
                  href={`/competitions/${comp.slug}`}
                  className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`View details for ${comp.name}`}
                />

                <CardHeader className="pb-3 relative z-10 pointer-events-none">
                  <div className="flex items-center justify-between gap-2 mb-2 pointer-events-auto">
                    <ImpactBadge level={comp.impact_level} className="text-3xs" />
                    {comp.external_url ? (
                      <a
                        href={comp.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Site</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 leading-snug text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
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

                  {/* Discipline tags */}
                  {disciplines.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {disciplines.slice(0, 3).map((disc) => (
                        <Badge
                          key={disc}
                          variant="outline"
                          className="text-4xs px-1.5 py-0 font-normal text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60"
                        >
                          {disc}
                        </Badge>
                      ))}
                      {disciplines.length > 3 && (
                        <span className="text-4xs text-zinc-400 self-center">
                          +{disciplines.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-2.5 text-xs text-zinc-500 dark:text-zinc-400 relative z-10 pointer-events-none">
                  {/* Registration status banner */}
                  {isRegistrationOpen && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-2xs">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      Registration open{regCloseDays !== null && regCloseDays <= 45 ? ` — closes in ${regCloseDays} day${regCloseDays !== 1 ? 's' : ''}` : ''}
                    </div>
                  )}

                  {/* Urgent deadline callout */}
                  {eventDays !== null && eventDays >= 0 && eventDays <= 30 && (
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

                <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2 relative z-10 pointer-events-none">
                  <div className="w-full">
                    <Button size="sm" className="w-full text-xs font-bold gap-1 bg-red-600 group-hover:bg-red-700 text-white shadow-xs">
                      View Details & Teams
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
