import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { EmptyState } from '@/components/domain/empty-state';
import { CompetitionDeadlineTimeline } from '@/components/domain/competition-deadline-timeline';
import { CompetitionCalendarView } from '@/components/domain/competition-calendar-view';
import { UpcomingEventsList } from '@/components/domain/upcoming-events-list';
import {
  Users,
  Plus,
  Send,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();

  // 1. My Teams
  const myTeamMemberships = db.team_members.filter((m) => m.user_id === user.id);
  const myTeams = myTeamMemberships
    .map((m) => {
      const team = db.teams.find((t) => t.id === m.team_id);
      const comp = team ? db.competitions.find((c) => c.id === team.competition_id) : null;
      const memberCount = db.team_members.filter((tm) => tm.team_id === m.team_id).length;
      return {
        team,
        comp,
        role: m.role,
        memberCount,
      };
    })
    .filter((t) => t.team !== undefined);

  // 2. Competitions (for Timeline & Calendar)
  const competitions = db.competitions;

  // 3. My Open Requests
  const myTeamReqs = db.team_requests.filter((r) => r.requested_by === user.id);
  const myCompReqs = db.competition_requests.filter((r) => r.requested_by === user.id);
  const myWorkshopReqs = db.workshop_requests.filter((r) => r.requested_by === user.id);
  const myFundingReqs = db.funding_requests.filter((r) => r.requested_by === user.id);
  const myGenReqs = (db.general_requests || []).filter((r) => r.requested_by === user.id);

  const allMyRequests = [
    ...myTeamReqs.map((r) => ({ kind: 'team', id: r.id, title: r.proposed_name, status: r.status, date: r.created_at })),
    ...myCompReqs.map((r) => ({ kind: 'competition', id: r.id, title: r.name, status: r.status, date: r.created_at })),
    ...myWorkshopReqs.map((r) => ({ kind: 'workshop', id: r.id, title: r.topic, status: r.status, date: r.created_at })),
    ...myFundingReqs.map((r) => ({ kind: 'funding', id: r.id, title: r.title, status: r.status, date: r.created_at })),
    ...myGenReqs.map((r) => ({ kind: 'general', id: r.id, title: r.title, status: r.status, date: r.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Orientation Banner for First-Time or Incomplete Onboarding */}
      {!user.onboarding_completed && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/80 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-800">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                    First-Time Member Orientation
                  </h2>
                  <Badge variant="warning" className="text-3xs font-mono font-bold">
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Complete your student profile, select technical disciplines, and activate your Room 604 makerspace clearance.
                </p>
              </div>
            </div>

            <Link href="/onboarding" className="shrink-0">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs h-9 px-4 rounded-lg cursor-pointer">
                <span>Complete Onboarding</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Sleek Compact Header (No oversized banner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track team projects, competition milestones, and upcoming club deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/requests/new">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 shadow-xs text-xs cursor-pointer h-9 px-4">
              <Plus className="h-4 w-4" />
              Submit Request
            </Button>
          </Link>
          <Link href="/requests">
            <Button size="sm" variant="outline" className="font-semibold text-xs gap-1.5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 px-4 cursor-pointer">
              <Send className="h-3.5 w-3.5 text-zinc-500" />
              <span>My Requests ({allMyRequests.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Responsive Balanced Grid (Even space distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Column (Teams, Timeline, Calendar View) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8 min-w-0">
          {/* My Teams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">My Teams</h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Browse Teams <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {myTeams.length === 0 ? (
              <EmptyState
                title="No Teams Joined"
                description="Join an existing engineering competition team or submit a new team proposal in the Request Center."
                actionHref="/competitions"
                actionLabel="Explore Teams & Competitions"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeams.map(({ team, comp, role, memberCount }) => (
                  <Card key={team?.id} className="hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-3xs font-mono">
                          {comp?.name || 'Competition'}
                        </Badge>
                        <StatusBadge status={role} />
                      </div>
                      <CardTitle className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">{team?.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {team?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 mt-2 p-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{memberCount} member{memberCount > 1 ? 's' : ''}</span>
                      <Link href={`/teams/${team?.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          Workspace
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Competition Deadlines Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">Competition Deadlines Timeline</h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  All Competitions <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <CompetitionDeadlineTimeline competitions={competitions} />
          </section>

          {/* Upcoming Competitions Monthly Calendar View */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">Upcoming Competitions Calendar</h2>
              </div>
              <span className="text-3xs text-zinc-500 font-mono">Monthly View</span>
            </div>

            <CompetitionCalendarView competitions={competitions} />
          </section>
        </div>

        {/* Right Column (Upcoming Events, Requests Tracker, Quick Action) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8 min-w-0">
          {/* Upcoming Events List */}
          <UpcomingEventsList competitions={competitions} />

          {/* My Open Requests Tracker */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">My Requests</h2>
              </div>
              <Link href="/requests" className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold">
                View All ({allMyRequests.length})
              </Link>
            </div>

            {allMyRequests.length === 0 ? (
              <Card className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                You have no active requests.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {allMyRequests.slice(0, 4).map((r) => (
                  <div
                    key={`${r.kind}-${r.id}`}
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-3xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded">
                          {r.kind === 'team' ? 'Team' : r.kind}
                        </span>
                        <span className="text-3xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {r.title}
                      </div>
                    </div>
                    <StatusBadge status={r.status as any} className="shrink-0 text-3xs" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Request Center Highlight */}
          <section className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Have a Project or Funding Need?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Submit equipment requests, parts procurement, competition team formations, and workshop ideas in one click.
            </p>
            <Link href="/requests/new" className="block pt-1">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                Create Request
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
