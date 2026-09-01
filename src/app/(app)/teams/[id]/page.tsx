import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { RosterTable } from '@/components/domain/roster-table';
import { WorkLogCard } from '@/components/domain/work-log-card';
import { WorkLogComposer } from '@/components/domain/work-log-composer';
import { EmptyState } from '@/components/domain/empty-state';
import {
  Users,
  Trophy,
  DollarSign,
  PenTool,
  ArrowLeft,
  Crown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { TeamMembershipButtons } from './membership-buttons';

export default async function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const db = getDb();
  const { id } = await params;

  const team = db.teams.find((t) => t.id === id);
  if (!team) {
    notFound();
  }

  const comp = db.competitions.find((c) => c.id === team.competition_id);
  const teamMemberships = db.team_members.filter((m) => m.team_id === team.id);
  const isMember = teamMemberships.some((m) => m.user_id === user.id);
  const isLead = teamMemberships.some((m) => m.user_id === user.id && m.role === 'lead');
  const isOfficer = user.role === 'officer' || user.role === 'admin';
  const canManageRoster = isLead || isOfficer;

  // Hydrate members with profiles
  const memberList = teamMemberships.map((m) => {
    const profile = db.profiles.find((p) => p.id === m.user_id);
    return {
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      full_name: profile?.full_name || null,
      email: profile?.email || 'Unknown',
      avatar_url: profile?.avatar_url || null,
      skills: profile?.skills || [],
    };
  });

  // Team Work Logs
  const teamLogs = db.work_logs
    .filter((l) => l.team_id === team.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Team Funding Requests
  const teamFunding = db.funding_requests
    .filter((f) => f.team_id === team.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <Link
          href={comp ? `/competitions/${comp.slug}` : '/competitions'}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {comp?.name || 'Competition'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-3xs font-mono">
                {comp?.name || 'Competition Subteam'}
              </Badge>
              {team.is_recruiting ? (
                <Badge variant="success" className="text-3xs">Recruiting Members</Badge>
              ) : (
                <Badge variant="secondary" className="text-3xs">Roster Closed</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {team.name}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <TeamMembershipButtons
              teamId={team.id}
              isMember={isMember}
              isLead={isLead}
              isRecruiting={team.is_recruiting}
            />
          </div>
        </div>
      </div>

      {/* Description & Workspace Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Subteam Mission & Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {team.description || 'No detailed team mission statement written.'}
              </p>
            </CardContent>
          </Card>

          {/* Work Logs Stream */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PenTool className="h-5 w-5 text-purple-600" />
                Team Work-Log Stream ({teamLogs.length})
              </h2>
            </div>

            {isMember && (
              <WorkLogComposer
                teams={[{ id: team.id, name: team.name }]}
                defaultTeamId={team.id}
              />
            )}

            {teamLogs.length === 0 ? (
              <EmptyState
                title="No Work Logs Yet"
                description="Team members haven't logged their technical progress yet."
              />
            ) : (
              <div className="space-y-3">
                {teamLogs.map((log) => {
                  const author = db.profiles.find((p) => p.id === log.author_id);
                  return (
                    <WorkLogCard
                      key={log.id}
                      log={log}
                      authorName={author?.full_name || null}
                      authorEmail={author?.email}
                      authorAvatar={author?.avatar_url}
                      teamName={team.name}
                      currentUserId={user.id}
                      isOfficer={isOfficer}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Roster and Funding */}
        <div className="space-y-6">
          {/* Quick Roster Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-brand-600" />
                  Roster ({memberList.length})
                </CardTitle>
                {canManageRoster && (
                  <span className="text-3xs bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                    Roster Admin
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2.5">
                {memberList.map((m) => (
                  <div key={m.user_id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-2xs text-slate-700 dark:text-slate-300 shrink-0">
                        {(m.full_name || m.email).substring(0, 1)}
                      </div>
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {m.full_name || m.email}
                      </span>
                    </div>
                    {m.role === 'lead' ? (
                      <Badge variant="purple" className="text-3xs py-0 gap-1 shrink-0">
                        <Crown className="h-2.5 w-2.5" /> Lead
                      </Badge>
                    ) : (
                      <span className="text-3xs text-slate-400 shrink-0">Member</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Funding Tracker */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Team Funding
                </CardTitle>
                <Link href="/funding/new">
                  <Button variant="ghost" size="sm" className="h-6 text-2xs text-brand-600">
                    + New
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {teamFunding.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  No funding requests filed for this team.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {teamFunding.map((f) => (
                    <div key={f.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {f.title}
                        </div>
                        <div className="text-2xs text-emerald-600 font-bold">
                          ${(f.amount_requested_cents / 100).toFixed(2)}
                        </div>
                      </div>
                      <StatusBadge status={f.status} className="text-3xs py-0 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
