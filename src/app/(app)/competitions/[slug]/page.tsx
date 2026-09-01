import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { EmptyState } from '@/components/domain/empty-state';
import {
  Trophy,
  Users,
  Calendar,
  ExternalLink,
  Plus,
  ArrowLeft,
  DollarSign,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { CompetitionSignupButton } from './signup-button';

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const db = getDb();
  const { slug } = await params;

  const comp = db.competitions.find((c) => c.slug === slug);
  if (!comp) {
    notFound();
  }

  const teams = db.teams.filter((t) => t.competition_id === comp.id);
  const mySignup = db.competition_signups.find(
    (s) => s.competition_id === comp.id && s.user_id === user.id
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back button & header */}
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all competitions
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-3xs font-mono">{comp.season || '2026-27'}</Badge>
              <StatusBadge status={comp.status} />
              {comp.organizer && (
                <span className="text-xs text-slate-500">by {comp.organizer}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {comp.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {comp.external_url && (
              <a href={comp.external_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  Official Rules & Site
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            <Link href={`/teams/request?competition=${comp.id}`}>
              <Button size="sm" className="font-semibold gap-1.5">
                <Plus className="h-4 w-4" />
                Request New Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Description & Key Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">About the Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {comp.description || 'No detailed description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Subteams section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                Active Subteams ({teams.length})
              </h2>
              <Link href={`/teams/request?competition=${comp.id}`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-brand-600">
                  <Plus className="h-3.5 w-3.5" /> Propose Another Team
                </Button>
              </Link>
            </div>

            {teams.length === 0 ? (
              <EmptyState
                title="No Subteams Formed Yet"
                description="Be the first to submit a team proposal for this competition challenge."
                actionHref={`/teams/request?competition=${comp.id}`}
                actionLabel="Submit Team Request"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((team) => {
                  const members = db.team_members.filter((tm) => tm.team_id === team.id);
                  const isUserMember = members.some((m) => m.user_id === user.id);

                  return (
                    <Card key={team.id} className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          {team.is_recruiting ? (
                            <Badge variant="success" className="text-3xs">Recruiting</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-3xs">Roster Full</Badge>
                          )}
                          {isUserMember && (
                            <Badge variant="purple" className="text-3xs">Joined</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold line-clamp-1">{team.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">
                          {team.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 p-4 mt-2">
                        <span className="text-xs text-slate-500 font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                        <Link href={`/teams/${team.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-brand-600 hover:text-brand-700">
                            Team Workspace →
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Sign Up / Registration Box */}
          <Card className="border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-brand-900 dark:text-brand-200">
                <Sparkles className="h-4 w-4 text-brand-600" />
                Member Interest Registration
              </CardTitle>
              <CardDescription className="text-xs text-brand-800/80 dark:text-brand-300/80">
                Express interest in this competition before joining or forming a specific subteam.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitionSignupButton
                competitionId={comp.id}
                initialSignup={mySignup}
              />
            </CardContent>
          </Card>

          {/* Quick Specs Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Competition Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Teams</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.max_teams || 'Unlimited'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Team Size</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.max_team_size || 'No limit'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Entry Fee</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {comp.entry_fee_cents ? `$${(comp.entry_fee_cents / 100).toFixed(2)}` : 'Free'}
                </span>
              </div>
              {comp.registration_closes_at && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Reg. Deadline</span>
                  <span className="font-semibold text-amber-600">
                    {new Date(comp.registration_closes_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {comp.event_starts_at && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Event Date</span>
                  <span className="font-semibold text-brand-600">
                    {new Date(comp.event_starts_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
