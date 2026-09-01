import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getTeamById } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import {
  Users,
  DollarSign,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import { TeamMembershipButtons } from './membership-buttons';

export default async function TeamWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const result = await getTeamById(id);
  if (!result) {
    notFound();
  }

  const { team, competition: comp, members: teamMemberships, funding: teamFunding } = result;

  const isMember = teamMemberships.some((m: any) => m.user_id === user.id);
  const isLead = teamMemberships.some((m: any) => m.user_id === user.id && m.role === 'lead');
  const isOfficer = user.role === 'officer' || user.role === 'admin';
  const canManageRoster = isLead || isOfficer;

  const memberList = teamMemberships.map((m: any) => ({
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at,
    full_name: m.profiles?.full_name || null,
    email: m.profiles?.email || 'FHS Student',
    avatar_url: m.profiles?.avatar_url || null,
    skills: m.profiles?.skills || [],
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <Link
          href={comp ? `/competitions/${comp.slug}` : '/competitions'}
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {comp?.name || 'Competition'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-3xs font-mono bg-zinc-900 border-zinc-800 text-zinc-400">
                {comp?.name || 'Competition Subteam'}
              </Badge>
              {team.is_recruiting ? (
                <Badge variant="success" className="text-3xs">Recruiting Members</Badge>
              ) : (
                <Badge variant="secondary" className="text-3xs">Roster Closed</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
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
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">Subteam Mission & Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {team.description || 'No detailed team mission statement written.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Roster and Funding */}
        <div className="space-y-6">
          {/* Quick Roster Card */}
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white">
                  <Users className="h-4 w-4 text-red-500" />
                  Roster ({memberList.length})
                </CardTitle>
                {canManageRoster && (
                  <span className="text-3xs bg-red-950 text-red-400 border border-red-800 font-bold px-1.5 py-0.5 rounded">
                    Roster Admin
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2.5">
                {memberList.map((m: any) => (
                  <div key={m.user_id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-2xs text-red-400 shrink-0">
                        {(m.full_name || m.email).substring(0, 1)}
                      </div>
                      <span className="truncate font-medium text-zinc-200">
                        {m.full_name || m.email}
                      </span>
                    </div>
                    {m.role === 'lead' ? (
                      <Badge variant="purple" className="text-3xs py-0 gap-1 shrink-0">
                        <Crown className="h-2.5 w-2.5" /> Lead
                      </Badge>
                    ) : (
                      <span className="text-3xs text-zinc-500 shrink-0">Member</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Funding Tracker */}
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-white">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Team Funding
                </CardTitle>
                <Link href="/requests/new?type=funding">
                  <Button variant="ghost" size="sm" className="h-6 text-2xs text-red-400 hover:text-red-300">
                    + Request
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {teamFunding.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  No funding requests filed for this team.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {teamFunding.map((f: any) => (
                    <div key={f.id} className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-900/50 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-200 truncate">
                          {f.title}
                        </div>
                        <div className="text-2xs text-emerald-400 font-bold">
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
