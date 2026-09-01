import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getCompetitions, getTeams } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { Trophy, Plus, Users, Calendar, ArrowRight } from 'lucide-react';

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const [competitionsData, teamsData, params] = await Promise.all([
    getCompetitions(),
    getTeams(),
    searchParams,
  ]);

  const statusFilter = params.status || 'all';

  let competitions = competitionsData;
  if (statusFilter !== 'all') {
    competitions = competitions.filter((c) => c.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-red-500" />
            Engineering Competitions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse active collegiate & high school challenges, join subteams, or request entry into a new competition.
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

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800">
        {[
          { id: 'all', label: 'All Competitions' },
          { id: 'active', label: 'Active Season' },
          { id: 'planned', label: 'Planned / Upcoming' },
          { id: 'completed', label: 'Past / Completed' },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={`/competitions${tab.id === 'all' ? '' : `?status=${tab.id}`}`}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => {
          const compTeams = teamsData.filter((t) => t.competition_id === comp.id);
          const totalMembers = compTeams.reduce((acc, t) => acc + (t.memberCount || 0), 0);

          return (
            <Card
              key={comp.id}
              className="flex flex-col justify-between hover:border-red-600/50 bg-zinc-950 border-zinc-850 transition-all shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-3xs font-mono bg-zinc-900 border-zinc-800 text-zinc-400">
                    {comp.season || '2026-27'}
                  </Badge>
                  <StatusBadge status={comp.status} />
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1 leading-snug text-white">
                  {comp.name}
                </CardTitle>
                {comp.organizer && (
                  <span className="text-xs font-medium text-zinc-400">
                    Organizer: {comp.organizer}
                  </span>
                )}
                <CardDescription className="text-xs text-zinc-400 line-clamp-3 mt-2 leading-relaxed">
                  {comp.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-2.5 text-xs text-zinc-400">
                <div className="flex items-center justify-between border-t border-zinc-850 pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                    <Users className="h-3.5 w-3.5 text-red-500" />
                    {compTeams.length} Team{compTeams.length !== 1 ? 's' : ''} ({totalMembers} members)
                  </span>
                  {comp.event_starts_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      {new Date(comp.event_starts_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-zinc-850 flex justify-between items-center gap-2">
                <Link href={`/competitions/${comp.slug}`} className="w-full">
                  <Button size="sm" className="w-full text-xs font-bold gap-1 bg-red-600 hover:bg-red-700 text-white">
                    View Subteams & Roster
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
