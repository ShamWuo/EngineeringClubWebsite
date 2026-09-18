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
import { ImpactBadge, IMPACT_DESCRIPTION, IMPACT_LABEL } from '@/components/domain/impact-badge';
import { EmptyState } from '@/components/domain/empty-state';
import {
  Users,
  ExternalLink,
  Plus,
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  Globe,
  Flag,
  Rocket,
  CircleDollarSign,
  UserPlus,
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

  const now = Date.now();
  const daysUntil = (iso: string | null) =>
    iso ? Math.ceil((new Date(iso).getTime() - now) / 86400000) : null;

  const regOpens = daysUntil(comp.registration_opens_at);
  const regCloses = daysUntil(comp.registration_closes_at);
  const eventIn = daysUntil(comp.event_starts_at);

  const isRegistrationOpen =
    comp.status !== 'completed' &&
    comp.status !== 'cancelled' &&
    (!comp.registration_opens_at || now >= new Date(comp.registration_opens_at).getTime()) &&
    (!comp.registration_closes_at || now <= new Date(comp.registration_closes_at).getTime());
  const isUpcoming = comp.status === 'idea' || comp.status === 'planned';

  // Build a chronological key-dates timeline
  const keyDates = [
    { label: 'Registration opens', at: comp.registration_opens_at, icon: UserPlus },
    { label: 'Registration closes', at: comp.registration_closes_at, icon: Clock },
    { label: 'Event starts', at: comp.event_starts_at, icon: Flag },
    { label: 'Event ends', at: comp.event_ends_at, icon: Rocket },
  ]
    .filter((d) => d.at)
    .map((d) => ({ ...d, time: new Date(d.at!).getTime(), iso: d.at! }))
    .sort((a, b) => a.time - b.time);

  const spotsLeft = comp.max_teams ? Math.max(comp.max_teams - teams.length, 0) : null;

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
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <ImpactBadge level={comp.impact_level} className="text-3xs" />
              <StatusBadge status={comp.status} className="text-3xs" />
              <Badge variant="outline" className="text-3xs font-mono">
                {comp.season || '2026-27'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {comp.name}
            </h1>
            {comp.organizer && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Run by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{comp.organizer}</span>
              </p>
            )}
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

      {/* Impact & registration status banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 p-4 rounded-xl bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              {IMPACT_LABEL[comp.impact_level] || 'Competition'} Impact Level
            </p>
            <p className="text-2xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {IMPACT_DESCRIPTION[comp.impact_level] || 'Competition tracked by the club.'}
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-2xs flex items-center gap-3 ${
            isRegistrationOpen
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-zinc-100/70 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isRegistrationOpen
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <p
              className={`text-xs font-bold ${
                isRegistrationOpen ? 'text-emerald-800 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {isRegistrationOpen ? 'Registration Open' : isUpcoming ? 'Registration Not Yet Open' : 'Registration Closed'}
            </p>
            {regCloses !== null && regCloses >= 0 && isRegistrationOpen && (
              <p className="text-2xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                {regCloses === 0 ? 'Closes today!' : `Closes in ${regCloses} day${regCloses !== 1 ? 's' : ''}`}
              </p>
            )}
            {regOpens !== null && regOpens > 0 && isUpcoming && (
              <p className="text-2xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Opens in {regOpens} day{regOpens !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Countdown strip */}
      {eventIn !== null && eventIn >= 0 && comp.status !== 'completed' && comp.status !== 'cancelled' && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60">
          <Rocket className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-xs font-bold text-red-700 dark:text-red-300">
            {eventIn === 0 ? 'Event day is here — good luck to our teams!' : `Event in ${eventIn} day${eventIn !== 1 ? 's' : ''}`}
          </p>
          {comp.event_ends_at && new Date(comp.event_ends_at).toLocaleDateString() !== new Date(comp.event_starts_at!).toLocaleDateString() && (
            <span className="text-2xs text-red-600/80 dark:text-red-400/80 ml-auto">
              through {new Date(comp.event_ends_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {/* Description & Key Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">About the Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {comp.description || 'No detailed description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Key dates timeline */}
          {keyDates.length > 0 && (
            <Card className="bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-red-600 dark:text-red-500" />
                  Key Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-4">
                  {keyDates.map((d) => {
                    const dt = new Date(d.iso);
                    const days = daysUntil(d.iso);
                    const isPast = d.time < now;
                    const Icon = d.icon;
                    return (
                      <li key={d.label} className="ml-6">
                        <span
                          className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900 ${
                            isPast
                              ? 'bg-zinc-300 dark:bg-zinc-700'
                              : 'bg-red-600 dark:bg-red-500'
                          }`}
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className={`text-xs font-bold ${isPast ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700' : 'text-zinc-900 dark:text-white'}`}>
                            {d.label}
                          </p>
                          {!isPast && days !== null && (
                            <span className="text-2xs font-semibold text-red-600 dark:text-red-400">
                              in {days} day{days !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-zinc-500 dark:text-zinc-400">
                          {dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Teams section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600 dark:text-red-500" />
                Active Teams ({teams.length})
                {spotsLeft !== null && comp.max_teams && (
                  <span className="text-2xs font-semibold text-zinc-500 dark:text-zinc-400">
                    · {spotsLeft} of {comp.max_teams} club spot{comp.max_teams !== 1 ? 's' : ''} remaining
                  </span>
                )}
              </h2>
              <Link href={`/requests/new?type=team`}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                  <Plus className="h-3.5 w-3.5" /> Propose Another Team
                </Button>
              </Link>
            </div>

            {teams.length === 0 ? (
              <EmptyState
                title="No Teams Formed Yet"
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
                    <Card key={team.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-2xs transition-all">
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
                      <CardContent className="pt-0 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 p-4 mt-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</span>
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
                Express interest in this competition before joining or forming a specific team.
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
          <Card className="bg-white dark:bg-zinc-900/90 border-zinc-200/90 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white">Competition Specs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <Globe className="h-3.5 w-3.5" />
                  Impact Level
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{IMPACT_LABEL[comp.impact_level] || comp.impact_level}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  Entry Fee
                </span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {comp.entry_fee_cents ? `$${(comp.entry_fee_cents / 100).toFixed(2)}` : 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Max Club Teams</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{comp.max_teams || 'Unlimited'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400">Max Team Size</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{comp.max_team_size || 'No limit'}</span>
              </div>
              {spotsLeft !== null && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Spots Remaining</span>
                  <span className={`font-semibold ${spotsLeft === 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {spotsLeft === 0 ? 'Full' : spotsLeft}
                  </span>
              </div>
              )}
              {comp.registration_closes_at && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800">
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
