import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { EmptyState } from '@/components/domain/empty-state';
import { getLinkIcon } from '@/components/domain/tiered-links-grid';
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Send,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FolderOpen,
  Sparkles,
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

  // 2. Upcoming Workshops & RSVPs
  const upcomingWorkshops = db.workshops
    .filter((w) => w.status === 'scheduled')
    .sort((a, b) => (a.starts_at && b.starts_at ? new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime() : 0));

  const myRsvps = new Set(
    db.workshop_rsvps.filter((r) => r.user_id === user.id).map((r) => r.workshop_id)
  );

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

  // 4. Tier 1 Primary Links
  const primaryLinks = db.links
    .filter((l) => l.tier === 'primary' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Orientation Banner for First-Time or Incomplete Onboarding */}
      {!user.onboarding_completed && (
        <div className="relative rounded-2xl overflow-hidden border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-zinc-900/40 p-5 backdrop-blur-xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-sm text-zinc-900 dark:text-white">
                    First-Time Member Orientation
                  </h2>
                  <Badge variant="outline" className="text-3xs font-mono font-bold text-amber-700 dark:text-amber-300 border-amber-400/50">
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Complete your student profile, select technical disciplines, and activate your Room 604 makerspace clearance.
                </p>
              </div>
            </div>

            <Link href="/onboarding" className="shrink-0">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm h-9 px-4 rounded-xl cursor-pointer">
                <span>Complete Onboarding</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 shadow-sm p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-600/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-2xs font-mono font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>STUDENT MEMBER PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Welcome back, {user.full_name || user.email}!
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              {myTeams.length > 0
                ? `You're currently active on ${myTeams.length} subteam${myTeams.length > 1 ? 's' : ''}. Check competition deadlines, workshop schedules, and review your grant requests.`
                : "Explore active engineering competitions, hands-on workshop sessions, and submit equipment grant requests."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/requests/new">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 shadow-sm text-xs cursor-pointer h-9 px-4">
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
      </div>

      {/* Tier 1 Primary Links Rail (Always above the fold) */}
      {primaryLinks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
              Essential Club Hubs (Tier 1 Pinned)
            </h2>
            <Link href="/links" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
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
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs hover:border-red-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-900/60 font-bold group-hover:scale-105 transition-transform">
                  {getLinkIcon(link.icon, 'h-4 w-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-200 truncate group-hover:text-red-600 dark:group-hover:text-red-400">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                  </div>
                  {link.description && (
                    <p className="text-3xs text-zinc-500 truncate mt-0.5">
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
        {/* Left 2 Columns: Teams & Competitions */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Subteams */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">My Subteams</h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Browse Teams <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            {myTeams.length === 0 ? (
              <EmptyState
                title="No Subteams Joined"
                description="Join an existing competition team or submit a new team proposal in the Request Center."
                actionHref="/competitions"
                actionLabel="Explore Competitions"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myTeams.map(({ team, comp, role, memberCount }) => (
                  <Card key={team?.id} className="hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md">
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

          {/* Quick Request Center Highlight */}
          <section className="p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Have a Project or Funding Need?</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Submit equipment requests, parts procurement, competition ideas, and workshop proposals in one click.</p>
              </div>
              <Link href="/requests/new">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0">
                  Create Request
                </Button>
              </Link>
            </div>
          </section>
        </div>

        {/* Right 1 Column: Upcoming Workshops & My Requests */}
        <div className="space-y-8">
          {/* Upcoming Workshops */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">Workshops</h2>
              </div>
              <Link href="/workshops">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  Schedule <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingWorkshops.slice(0, 3).map((w) => {
                const isRsvped = myRsvps.has(w.id);

                return (
                  <Card key={w.id} className="p-4 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-3xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-950/80 dark:border-red-900/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {w.skill_level || 'All Levels'}
                      </span>
                      {isRsvped && (
                        <span className="flex items-center gap-1 text-3xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/80 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> RSVP'd
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">
                      {w.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-3xs text-zinc-500 dark:text-zinc-400">
                      {w.starts_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-red-600 dark:text-red-500" />
                          {new Date(w.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span>{w.location || 'Makerspace'}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                      <Link href={`/workshops/${w.slug}`}>
                        <Button size="sm" variant="outline" className="h-6 text-3xs">
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
                <FolderOpen className="h-5 w-5 text-red-600 dark:text-red-500" />
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">My Requests</h2>
              </div>
              <Link href="/requests" className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold">
                View All ({allMyRequests.length})
              </Link>
            </div>

            {allMyRequests.length === 0 ? (
              <Card className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800">
                You have no active requests.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {allMyRequests.slice(0, 4).map((r) => (
                  <div
                    key={`${r.kind}-${r.id}`}
                    className="p-3 rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 flex items-center justify-between gap-3 text-xs shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-3xs uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-950/80 dark:border-red-900/60 px-1.5 py-0.2 rounded">
                          {r.kind}
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
        </div>
      </div>
    </div>
  );
}
