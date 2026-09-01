import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getCompetitionBySlug, CompetitionRow } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { EmptyState } from '@/components/domain/empty-state';
import {
  Users,
  ExternalLink,
  Plus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { CompetitionSignupButton } from './signup-button';

export default async function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;

  const result = await getCompetitionBySlug(slug);
  if (!result || !result.comp) {
    notFound();
  }

  const comp: CompetitionRow = result.comp;
  const teams = result.teams;

  const supabase = await createClient();
  const { data: mySignup } = await (supabase.from('competition_signups') as any)
    .select('*')
    .eq('competition_id', comp.id)
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Back button & header */}
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all competitions
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-3xs font-mono">
                {comp.season || '2026-27'}
              </Badge>
              <StatusBadge status={comp.status} />
              {comp.organizer && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">by {comp.organizer}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
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
            <Link href={`/requests/new?type=team`}>
              <Button size="sm" className="font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs">
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
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">About the Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {comp.description || 'No detailed description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Subteams section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-500" />
                Active Subteams ({teams.length})
              </h2>
              <Link href={`/requests/new?type=team`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  <Plus className="h-3.5 w-3.5" /> Propose Another Team
                </Button>
              </Link>
            </div>

            {teams.length === 0 ? (
              <EmptyState
                title="No Subteams Formed Yet"
                description="Be the first to submit a team proposal for this competition challenge in the Request Center."
                actionHref={`/requests/new?type=team`}
                actionLabel="Submit Team Request"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((team: any) => {
                  const members = team.team_members || [];
                  const isUserMember = members.some((m: any) => m.user_id === user.id);

                  return (
                    <Card key={team.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 shadow-2xs transition-all">
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
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">{team.name}</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                          {team.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 p-4 mt-2">
                        <span className="text-xs text-zinc-500 font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                        <Link href={`/teams/${team.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
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
          <Card className="border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-zinc-900 dark:text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-red-700 dark:text-red-300">
                <Sparkles className="h-4 w-4 text-red-600 dark:text-red-400" />
                Member Interest Registration
              </CardTitle>
              <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
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
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">Competition Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500 dark:text-zinc-400">Max Teams</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{comp.max_teams || 'Unlimited'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500 dark:text-zinc-400">Max Team Size</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{comp.max_team_size || 'No limit'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500 dark:text-zinc-400">Entry Fee</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {comp.entry_fee_cents ? `$${(comp.entry_fee_cents / 100).toFixed(2)}` : 'Free'}
                </span>
              </div>
              {comp.registration_closes_at && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="text-zinc-500 dark:text-zinc-400">Reg. Deadline</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {new Date(comp.registration_closes_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {comp.event_starts_at && (
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">Event Date</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
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
