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
  Trophy,
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
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-red-900/60 bg-gradient-to-r from-red-950 via-zinc-950 to-black text-white p-6 sm:p-8 shadow-2xl shadow-red-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-2xs font-mono uppercase tracking-widest text-red-400 font-bold">
                Student Member Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user.full_name || user.email}!
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              {myTeams.length > 0
                ? `You're currently active on ${myTeams.length} subteam${myTeams.length > 1 ? 's' : ''}. Check competition updates or submit new requests.`
                : "Explore active engineering competitions, workshop sessions, and submit requests."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/requests/new">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 shadow-lg shadow-red-950/60 text-xs cursor-pointer">
                <Plus className="h-4 w-4" />
                Submit Request
              </Button>
            </Link>
            <Link href="/requests">
              <Button size="sm" variant="secondary" className="font-bold text-xs gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 cursor-pointer">
                <Send className="h-3.5 w-3.5 text-red-400" />
                My Requests ({allMyRequests.length})
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
            <Link href="/links" className="text-xs font-semibold text-red-400 hover:underline">
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
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-zinc-850 bg-zinc-900/60 shadow-sm hover:border-red-600/50 hover:bg-zinc-900 transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-950/80 text-red-400 border border-red-900/60 font-bold group-hover:scale-105 transition-transform">
                  {getLinkIcon(link.icon, 'h-4 w-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-200 truncate group-hover:text-red-400">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
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
                <Users className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-black text-white">My Subteams</h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-400 hover:text-white">
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
                  <Card key={team?.id} className="hover:border-zinc-700 bg-zinc-950 border-zinc-850 transition-all flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge variant="outline" className="text-3xs font-mono bg-zinc-900 border-zinc-800 text-zinc-400">
                          {comp?.name || 'Competition'}
                        </Badge>
                        <StatusBadge status={role} />
                      </div>
                      <CardTitle className="text-base font-bold text-white line-clamp-1">{team?.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-400 line-clamp-2">
                        {team?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex items-center justify-between border-t border-zinc-850 mt-2 p-4">
                      <span className="text-xs text-zinc-500 font-medium">{memberCount} member{memberCount > 1 ? 's' : ''}</span>
                      <Link href={`/teams/${team?.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-red-400 hover:text-red-300">
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
          <section className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Have a Project or Funding Need?</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Submit equipment requests, parts procurement, competition ideas, and workshop proposals in one click.</p>
              </div>
              <Link href="/requests/new">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
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
                <Calendar className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-black text-white">Workshops</h2>
              </div>
              <Link href="/workshops">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-zinc-400 hover:text-white">
                  Schedule <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingWorkshops.slice(0, 3).map((w) => {
                const isRsvped = myRsvps.has(w.id);

                return (
                  <Card key={w.id} className="p-4 hover:border-zinc-700 bg-zinc-950 border-zinc-850 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-3xs font-mono font-bold text-red-400 uppercase tracking-wider">
                        {w.skill_level || 'All Levels'}
                      </span>
                      {isRsvped && (
                        <span className="flex items-center gap-1 text-3xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> RSVP'd
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-zinc-100 leading-snug line-clamp-1">
                      {w.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-3xs text-zinc-500">
                      {w.starts_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(w.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span>{w.location || 'Makerspace'}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-850 flex justify-end">
                      <Link href={`/workshops/${w.slug}`}>
                        <Button size="sm" variant="outline" className="h-6 text-3xs bg-zinc-900 border-zinc-800 text-zinc-300">
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
                <FolderOpen className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-black text-white">My Requests</h2>
              </div>
              <Link href="/requests" className="text-xs text-red-400 hover:underline font-semibold">
                View All ({allMyRequests.length})
              </Link>
            </div>

            {allMyRequests.length === 0 ? (
              <Card className="p-4 text-center text-xs text-zinc-500 bg-zinc-950 border-zinc-850">
                You have no active requests.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {allMyRequests.slice(0, 4).map((r) => (
                  <div
                    key={`${r.kind}-${r.id}`}
                    className="p-3 rounded-lg border border-zinc-850 bg-zinc-950 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-3xs uppercase tracking-wider text-red-400 bg-red-950/80 border border-red-900/60 px-1.5 py-0.2 rounded">
                          {r.kind}
                        </span>
                        <span className="text-3xs text-zinc-500 font-mono">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-semibold text-zinc-200 truncate">
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
