import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { Trophy, Plus, Users, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const db = getDb();
  const params = await searchParams;
  const statusFilter = params.status || 'all';

  let competitions = db.competitions;
  if (statusFilter !== 'all') {
    competitions = competitions.filter((c) => c.status === statusFilter);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-brand-600" />
            Engineering Competitions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse active collegiate challenges, join subteams, or request entry into a new competition.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/competitions/request">
            <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              Propose New Competition
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
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
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => {
          const teams = db.teams.filter((t) => t.competition_id === comp.id);
          const totalMembers = teams.reduce((acc, t) => {
            return acc + db.team_members.filter((tm) => tm.team_id === t.id).length;
          }, 0);

          return (
            <Card
              key={comp.id}
              className="flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-2xs hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-3xs font-mono">
                    {comp.season || '2026-27'}
                  </Badge>
                  <StatusBadge status={comp.status} />
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1 leading-snug">
                  {comp.name}
                </CardTitle>
                {comp.organizer && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Organizer: {comp.organizer}
                  </span>
                )}
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                  {comp.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-2.5 text-xs text-slate-500">
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Users className="h-3.5 w-3.5 text-brand-600" />
                    {teams.length} Team{teams.length !== 1 ? 's' : ''} ({totalMembers} members)
                  </span>
                  {comp.event_starts_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(comp.event_starts_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
                <Link href={`/competitions/${comp.slug}`} className="w-full">
                  <Button size="sm" variant="default" className="w-full text-xs font-semibold gap-1">
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
