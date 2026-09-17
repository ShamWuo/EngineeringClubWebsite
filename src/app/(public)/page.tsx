import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { getDb } from '@/lib/db/mock-data';
import {
  Users,
  ArrowRight,
  Calendar,
  MapPin,
  Trophy,
  Wrench,
  Cpu,
  Zap,
  CheckCircle2,
  DollarSign,
  Compass,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { RidgeScene } from '@/components/landing/ridge-scene';
import { HeroCopy } from '@/components/landing/hero-copy';
import { CountUp } from '@/components/landing/count-up';

export default function LandingPage() {
  const db = getDb();
  const competitions = db.competitions.filter((c) => c.status === 'active' || c.status === 'planned');
  const workshops = db.workshops.filter((w) => w.status === 'scheduled');
  const teamCount = db.teams.length;
  const memberCount = db.profiles.filter((p) => p.is_active).length;

  const teamsWithMeta = db.teams.map((t) => {
    const comp = db.competitions.find((c) => c.id === t.competition_id);
    const members = db.team_members.filter((m) => m.team_id === t.id);
    const leadMember = members.find((m) => m.role === 'lead');
    const leadProfile = leadMember ? db.profiles.find((p) => p.id === leadMember.user_id) : null;
    return {
      ...t,
      competition: comp,
      memberCount: members.length,
      leadName: leadProfile?.full_name || 'Squad Lead',
    };
  });

  return (
    <>
      {/* Full-bleed Vector Ridge Hero */}
      <section className="relative isolate h-[calc(100svh-4rem)] min-h-[580px] max-h-[920px] overflow-hidden">
        <RidgeScene />
        <HeroCopy className="relative z-20" />
      </section>

      {/* Floating stats panel — bridges the hero and the content below */}
      <div className="relative z-30 -mt-12 px-4 sm:px-6 lg:px-8">
        <section className="max-w-6xl mx-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl shadow-zinc-950/5 dark:shadow-black/40 p-5 sm:p-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-zinc-500">Challenges</span>
                <Trophy className="h-4 w-4 text-red-600 dark:text-red-500" />
              </div>
              <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                <CountUp to={competitions.length}>{competitions.length}</CountUp>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Collegiate & High School Leagues</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-zinc-500">Subteams</span>
                <Users className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                <CountUp to={teamCount}>{teamCount}</CountUp>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Active Hardware Squads</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-zinc-500">Project Grants</span>
                <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                <CountUp to={db.club_settings.budget_ceiling_cents / 100} prefix="$">
                  ${(db.club_settings.budget_ceiling_cents / 100).toLocaleString()}
                </CountUp>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Annual Prototyping Ceiling</div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/40 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-bold uppercase tracking-wider text-zinc-500">Engineers</span>
                <Cpu className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                <CountUp to={memberCount}>{memberCount}</CountUp>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Registered Student Members</div>
            </div>
          </div>
        </section>
      </div>

      {/* Main Page Content */}
      <div className="pb-12 pt-20 max-w-7xl mx-auto">
        {/* Subteams Showcase — light framed panel */}
        <section id="subteams" className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                <Zap className="h-3.5 w-3.5" />
                Active Engineering Rosters
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                Fairview Engineering Squads
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Join a specialized discipline subteam or recruit peers to establish a new competitive squad.
              </p>
            </div>
            <Link href="/requests/new?type=team">
              <Button size="sm" variant="outline" className="gap-1.5 font-bold text-xs h-9">
                <Sparkles className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                <span>Pitch New Squad</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamsWithMeta.map((t) => (
              <Card
                key={t.id}
                className="flex flex-col justify-between hover:border-red-500/50 dark:hover:border-red-600/50 bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all rounded-2xl p-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-3xs font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {t.competition?.name || 'Independent Subteam'}
                    </span>
                    {t.is_recruiting ? (
                      <span className="inline-flex items-center gap-1 text-3xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Recruiting
                      </span>
                    ) : (
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Roster Locked
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-base text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {t.name}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      {t.memberCount} Engineer{t.memberCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-3xs font-mono">Lead: {t.leadName}</span>
                  </div>

                  <Link href={`/teams/${t.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1 group-hover:border-red-500/50">
                      <span>View Team & Roster</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* How We Build — dark blueprint band with a connected pipeline rail */}
        <section
          id="how-it-works"
          className="relative mt-20 py-16 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-y border-zinc-800 overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-50 dark:from-zinc-950 to-transparent opacity-60 pointer-events-none dark:opacity-0" />
          <div className="relative max-w-7xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-500">
                <Compass className="h-3.5 w-3.5" />
                The Knight Innovation Pipeline
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                How Fairview Knights Build
              </h2>
              <p className="text-xs text-zinc-400">
                From whiteboard concept to regional podiums: a frictionless, student-driven workflow.
              </p>
            </div>

            <div className="relative">
              {/* Connector rail */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400 font-bold font-mono text-sm border border-red-900/60 ring-4 ring-zinc-950">
                    01
                  </div>
                  <h3 className="font-extrabold text-sm text-white">Propose & Form Squad</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Submit an entry for a new national challenge or assemble a subteam for an existing competition. Officers review weekly.
                  </p>
                </div>

                <div className="relative p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400 font-bold font-mono text-sm border border-red-900/60 ring-4 ring-zinc-950">
                    02
                  </div>
                  <h3 className="font-extrabold text-sm text-white">Secure Grants & Parts</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Itemize hardware budgets with vendor URLs. The club funds approved motors, sensors, microcontrollers, and raw materials.
                  </p>
                </div>

                <div className="relative p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400 font-bold font-mono text-sm border border-red-900/60 ring-4 ring-zinc-950">
                    03
                  </div>
                  <h3 className="font-extrabold text-sm text-white">Build in Room 604</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Manufacture components in our dedicated makerspace using Bambu Lab 3D printers, CNC mills, and soldering benches.
                  </p>
                </div>

                <div className="relative p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400 font-bold font-mono text-sm border border-red-900/60 ring-4 ring-zinc-950">
                    04
                  </div>
                  <h3 className="font-extrabold text-sm text-white">Compete & Showcase</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Travel to regional competitions, publish technical work logs, and build an engineering portfolio for top collegiate STEM programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Competitions — tinted red paper band */}
        <section className="relative mt-20">
          <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-red-50/70 via-red-50/30 to-transparent dark:from-red-950/25 dark:via-red-950/10 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                  <Trophy className="h-3.5 w-3.5" />
                  National & Collegiate Leagues
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Active Challenges
                </h2>
              </div>
              <Link href="/competitions">
                <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  View All Challenges <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {competitions.slice(0, 3).map((comp) => {
                const compTeams = db.teams.filter((t) => t.competition_id === comp.id);

                return (
                  <Card key={comp.id} className="flex flex-col justify-between hover:border-red-500/50 bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800 transition-all shadow-xs hover:shadow-md rounded-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-3xs font-mono">{comp.season || '2026-27'}</Badge>
                        <StatusBadge status={comp.status} />
                      </div>
                      <CardTitle className="text-base font-extrabold text-zinc-900 dark:text-white line-clamp-1">{comp.name}</CardTitle>
                      <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {comp.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          {compTeams.length} squad{compTeams.length !== 1 ? 's' : ''} enrolled
                        </span>
                        {comp.organizer && <span className="truncate max-w-[120px] font-mono text-3xs">{comp.organizer}</span>}
                      </div>
                      <Link href={`/competitions/${comp.slug}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                          Explore Teams & Join
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workshops — white cards with red left spine, breathing room */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                <Wrench className="h-3.5 w-3.5" />
                Hands-On Skill Building
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                Upcoming Technical Masterclasses
              </h2>
            </div>
            <Link href="/workshops">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                All Workshops <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map((w) => (
              <Card key={w.id} className="p-6 border-l-4 border-l-red-600 bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white">{w.title}</h3>
                  <span className="text-3xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-950/80 dark:border-red-900/60 px-2.5 py-0.5 rounded-full shrink-0">
                    {w.skill_level || 'All Levels'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {w.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                  {w.starts_at && (
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <Calendar className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                      {new Date(w.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(w.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {w.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      {w.location}
                    </span>
                  )}
                  {w.instructor_name && (
                    <span className="text-3xs font-mono text-zinc-400">
                      Inst: {w.instructor_name}
                    </span>
                  )}
                </div>
                <Link href={`/workshops/${w.slug}`}>
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold">
                    RSVP & Access Syllabus
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Makerspace — dotted paper band with corner accents */}
        <section
          id="makerspace"
          className="relative mt-24 py-16 px-4 sm:px-6 lg:px-8 border-y border-zinc-200/70 dark:border-zinc-800/70 bg-dot-pattern bg-zinc-50/70 dark:bg-zinc-900/30"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                <Layers className="h-3.5 w-3.5" />
                Room 604 & Innovation Lab
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                Engineering Lab Capabilities
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Everything student teams need to iterate from CAD sketch to competition-ready metal and composites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="relative p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2.5 overflow-hidden">
                <span aria-hidden="true" className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-red-200 dark:border-red-900/40 rounded-tr-2xl" />
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center font-bold">
                  <Cpu className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Additive Prototyping</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Bambu Lab X1-Carbon high-speed printers and Formlabs Form 4 SLA resin printers for rapid ducting, electronics enclosures, and brackets.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2.5 overflow-hidden">
                <span aria-hidden="true" className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-red-200 dark:border-red-900/40 rounded-tr-2xl" />
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center font-bold">
                  <Wrench className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">CNC & Precision Machining</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Tormach PCNC milling machine, precision lathe, and 100W CO2 laser cutter for cutting structural aluminum, delrin, and acrylic.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2.5 overflow-hidden">
                <span aria-hidden="true" className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-red-200 dark:border-red-900/40 rounded-tr-2xl" />
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center font-bold">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Electronics & PCB Lab</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Weller ESD soldering stations, 4-channel digital oscilloscopes, DC bench power supplies, and KiCad design templates.
                </p>
              </div>

              <div className="relative p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs space-y-2.5 overflow-hidden">
                <span aria-hidden="true" className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-red-200 dark:border-red-900/40 rounded-tr-2xl" />
                <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400 flex items-center justify-center font-bold">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">CAD & FEA Simulation</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  High-performance design workstations equipped with SolidWorks 2026, Ansys structural & aerodynamic simulation, and MATLAB.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ — ruled ledger style */}
        <section id="faq" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 space-y-2">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              <HelpCircle className="h-3.5 w-3.5" />
              Got Questions?
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          {[
            {
              q: 'Who is eligible to join?',
              a: 'Any student currently enrolled at Fairview High School with an active bvsd.org school Google account is eligible. No previous robotics or coding experience is required!',
            },
            {
              q: 'Are there membership fees or dues?',
              a: 'Zero membership fees. All general club sessions, safety training, workshops, and lab machine usage are 100% free to all Fairview students.',
            },
            {
              q: 'How does project hardware funding work?',
              a: 'Teams itemize needed parts (motors, carbon fiber, PCBs) in the member portal Request Center. Club officers review and allocate grant funding directly to suppliers.',
            },
            {
              q: 'How do I get safety certified on the machines?',
              a: 'Attend our Shop Safety Certification workshop held bi-weekly on Thursdays in the Machine Shop. Passing certification grants access to the PCNC mill, lathe, and laser cutter.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-8 py-5 border-b border-zinc-200 dark:border-zinc-800 group"
            >
              <h3 className="md:col-span-2 font-bold text-sm text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {item.q}
              </h3>
              <p className="md:col-span-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </section>

        {/* High-Impact Closing Call to Action */}
        <section className="relative mx-4 sm:mx-6 lg:mx-8 mt-24 mb-4 rounded-3xl overflow-hidden border border-red-500/30 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-8 sm:p-14 text-center space-y-5 shadow-2xl shadow-red-950/30">
          <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 text-2xs font-mono font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              JOIN OVER {memberCount} FAIRVIEW BUILDERS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to engineer the future?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Log in with your BVSD student account to join competition squads, submit hardware grant requests, and RSVP for technical workshops.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-950/40 text-xs px-6 h-10 cursor-pointer">
                  <span>Sign In To Portal</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/competitions" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs font-semibold bg-white/10 hover:bg-white/15 border-white/20 text-white h-10 px-6 cursor-pointer">
                  View Competitions
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
