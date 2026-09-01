import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { WorkLogCard } from '@/components/domain/work-log-card';
import { EmptyState } from '@/components/domain/empty-state';
import { getLinkIcon } from '@/components/domain/tiered-links-grid';
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  PenTool,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();

  // 1. My Teams
  const myTeamMemberships = db.team_members.filter((m) => m.user_id === user.id);
  const myTeams = myTeamMemberships.map((m) => {
    const team = db.teams.find((t) => t.id === m.team_id);
    const comp = team ? db.competitions.find((c) => c.id === team.competition_id) : null;
    const memberCount = db.team_members.filter((tm) => tm.team_id === m.team_id).length;
    return {
      team,
      comp,
      role: m.role,
      memberCount,
    };
  }).filter((t) => t.team !== undefined);

  // 2. My Competitions & Signups
  const mySignups = db.competition_signups.filter((s) => s.user_id === user.id);
  const myCompetitions = mySignups.map((s) => {
    const comp = db.competitions.find((c) => c.id === s.competition_id);
    return { signup: s, comp };
  }).filter((c) => c.comp !== undefined);

  // 3. Upcoming Workshops & RSVPs
  const upcomingWorkshops = db.workshops
    .filter((w) => w.status === 'scheduled')
    .sort((a, b) => (a.starts_at && b.starts_at ? new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime() : 0));

  const myRsvps = new Set(
    db.workshop_rsvps.filter((r) => r.user_id === user.id).map((r) => r.workshop_id)
  );

  // 4. My Open Requests
  const myTeamReqs = db.team_requests.filter((r) => r.requested_by === user.id);
  const myCompReqs = db.competition_requests.filter((r) => r.requested_by === user.id);
  const myWorkshopReqs = db.workshop_requests.filter((r) => r.requested_by === user.id);
  const myFundingReqs = db.funding_requests.filter((r) => r.requested_by === user.id);

  const allMyRequests = [
    ...myTeamReqs.map((r) => ({ kind: 'team', id: r.id, title: r.proposed_name, status: r.status, date: r.created_at })),
    ...myCompReqs.map((r) => ({ kind: 'competition', id: r.id, title: r.name, status: r.status, date: r.created_at })),
    ...myWorkshopReqs.map((r) => ({ kind: 'workshop', id: r.id, title: r.topic, status: r.status, date: r.created_at })),
    ...myFundingReqs.map((r) => ({ kind: 'funding', id: r.id, title: r.title, status: r.status, date: r.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 5. Recent Work Logs
  const myTeamIds = myTeamMemberships.map((m) => m.team_id);
  const recentLogs = db.work_logs
    .filter((l) => l.author_id === user.id || (l.team_id && myTeamIds.includes(l.team_id)) || l.visibility === 'club')
    .slice(0, 4);

  // 6. Tier 1 Primary Links
  const primaryLinks = db.links
    .filter((l) => l.tier === 'primary' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user.full_name || user.email}!
              </h1>
            </div>
            <p className="text-sm text-brand-200 max-w-xl">
              {myTeams.length > 0
                ? `You're currently active on ${myTeams.length} subteam${myTeams.length > 1 ? 's' : ''}. Keep track of your team milestones and log your hours.`
                : "Explore active competitions and find a subteam to join this season."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/logs">
              <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold gap-1.5 shadow-xs">
                <PenTool className="h-3.5 w-3.5" />
                Log Work
              </Button>
            </Link>
            <Link href="/teams/request">
              <Button size="sm" variant="secondary" className="font-semibold gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0">
                <Plus className="h-3.5 w-3.5" />
                Request Team
              </Button>
            </Link>
            <Link href="/funding/new">
              <Button size="sm" variant="secondary" className="font-semibold gap-1.5 bg-white/10 hover:bg-white/20 text-white border-0">
                <DollarSign className="h-3.5 w-3.5" />
                Request Funding
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 1 Primary Links Rail (Always above the fold) */}
      {primaryLinks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Essential Club Hubs (Tier 1 Pinned)
            </h2>
            <Link href="/links" className="text-xs font-semibold text-brand-600 hover:underline">
              View All Directory
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {primaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-brand-200/80 dark:border-brand-900/50 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md hover:border-brand-400 dark:hover:border-brand-600 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 font-bold group-hover:scale-105 transition-transform">
                  {getLinkIcon(link.icon, 'h-4 w-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                  </div>
                  {link.description && (
                    <p className="text-3xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Teams & Work Logs */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Subteams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Subteams</h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Browse Teams <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {myTeams.length === 0 ? (
              <EmptyState
                title="No Subteams Yet"
                description="Join an existing competition team or submit a new team proposal to get started."
                actionHref="/competitions"
                actionLabel="Explore Competitions"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeams.map(({ team, comp, role, memberCount }) => (
                  <Card key={team?.id} className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-3xs font-mono">{comp?.name || 'Competition'}</Badge>
                        <StatusBadge status={role} />
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-1">{team?.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {team?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2 p-4">
                      <span className="text-xs text-slate-500 font-medium">{memberCount} member{memberCount > 1 ? 's' : ''}</span>
                      <Link href={`/teams/${team?.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-brand-600 hover:text-brand-700">
                          Team Workspace
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recent Team Work-Logs */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Recent Work Logs
                </h2>
              </div>
              <Link href="/logs">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  All Logs <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <EmptyState
                title="No Work Logs Yet"
                description="Share what technical problems you worked on, parts machined, or code committed."
                actionHref="/logs"
                actionLabel="Write First Log Entry"
              />
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => {
                  const author = db.profiles.find((p) => p.id === log.author_id);
                  const team = db.teams.find((t) => t.id === log.team_id);
                  return (
                    <WorkLogCard
                      key={log.id}
                      log={log}
                      authorName={author?.full_name || null}
                      authorEmail={author?.email}
                      authorAvatar={author?.avatar_url}
                      teamName={team?.name}
                      currentUserId={user.id}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right 1 Column: Upcoming Workshops & My Requests */}
        <div className="space-y-8">
          {/* Upcoming Workshops */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Workshops</h2>
              </div>
              <Link href="/workshops">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Schedule <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingWorkshops.slice(0, 3).map((w) => {
                const isRsvped = myRsvps.has(w.id);

                return (
                  <Card key={w.id} className="p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-2xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                        {w.skill_level || 'All Levels'}
                      </span>
                      {isRsvped && (
                        <span className="flex items-center gap-1 text-2xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> RSVP'd
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                      {w.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-2xs text-slate-500">
                      {w.starts_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(w.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span>{w.location || 'Makerspace'}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Link href={`/workshops/${w.slug}`}>
                        <Button size="sm" variant="outline" className="h-6 text-2xs">
                          {isRsvped ? 'View Details' : 'RSVP Now'}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* My Open Requests Tracker */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Requests</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {allMyRequests.length} total
              </span>
            </div>

            {allMyRequests.length === 0 ? (
              <Card className="p-4 text-center text-xs text-slate-400">
                You have no active requests.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {allMyRequests.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-3xs uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {r.kind}
                        </span>
                        <span className="text-2xs text-slate-400">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {r.title}
                      </div>
                    </div>
                    <StatusBadge status={r.status} className="shrink-0 text-3xs" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
