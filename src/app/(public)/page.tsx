import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { getDb } from '@/lib/db/mock-data';
import {
  Trophy,
  Users,
  Lightbulb,
  DollarSign,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const db = getDb();
  const competitions = db.competitions.filter((c) => c.status === 'active' || c.status === 'planned');
  const workshops = db.workshops.filter((w) => w.status === 'scheduled');
  const teamCount = db.teams.length;
  const memberCount = db.profiles.filter((p) => p.is_active).length;

  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-20 space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>2026-27 Competition Season Now Open</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
          Where University Engineers <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">
            Build The Impossible.
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The centralized platform for student engineering subteams. Join competition rosters, apply for project funding, attend advanced hardware workshops, and log your technical progress.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-bold shadow-md">
              Sign In With School Email
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
              Enter Portal Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <div className="text-2xl font-black text-brand-600">{competitions.length}</div>
            <div className="text-xs text-slate-500 font-medium">Major Competitions</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <div className="text-2xl font-black text-purple-600">{teamCount}</div>
            <div className="text-xs text-slate-500 font-medium">Active Subteams</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <div className="text-2xl font-black text-emerald-600">${(db.club_settings.budget_ceiling_cents / 100).toLocaleString()}</div>
            <div className="text-xs text-slate-500 font-medium">Annual Project Budget</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <div className="text-2xl font-black text-amber-600">{memberCount}</div>
            <div className="text-xs text-slate-500 font-medium">Club Engineers</div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Active & Planned Competitions
            </h2>
            <p className="text-sm text-slate-500">
              Join an existing team, or submit a request to form a new squad.
            </p>
          </div>
          <Link href="/competitions">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitions.slice(0, 3).map((comp) => {
            const compTeams = db.teams.filter((t) => t.competition_id === comp.id);

            return (
              <Card key={comp.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-3xs font-mono">{comp.season || '2026-27'}</Badge>
                    <StatusBadge status={comp.status} />
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1">{comp.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 line-clamp-2">
                    {comp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {compTeams.length} teams registered
                    </span>
                    {comp.organizer && <span className="truncate max-w-[120px]">{comp.organizer}</span>}
                  </div>
                  <Link href={`/competitions/${comp.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                      Explore Teams & Sign Up
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Upcoming Workshops Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Upcoming Technical Workshops
            </h2>
            <p className="text-sm text-slate-500">
              Hands-on skill building in CAD, PCB design, FEA, embedded systems, and machine shop safety.
            </p>
          </div>
          <Link href="/workshops">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All Workshops <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((w) => (
            <Card key={w.id} className="p-5 border-l-4 border-l-brand-600">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{w.title}</h3>
                <Badge variant="info" className="text-3xs">{w.skill_level || 'All Levels'}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                {w.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
                {w.starts_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-600" />
                    {new Date(w.starts_at).toLocaleDateString()}
                  </span>
                )}
                {w.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    {w.location}
                  </span>
                )}
              </div>
              <Link href={`/workshops/${w.slug}`}>
                <Button size="sm" className="w-full text-xs font-semibold">
                  RSVP & View Materials
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-950 text-white p-8 sm:p-12 text-center space-y-4 shadow-xl">
        <h2 className="text-3xl font-extrabold">Ready to start building?</h2>
        <p className="text-sm text-brand-100 max-w-xl mx-auto">
          Log in with your verified school email account to unlock subteam access, equipment calendars, project funding, and competition signups.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="lg" className="bg-white text-brand-900 hover:bg-brand-50 font-bold shadow-lg">
              Sign In To Club Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
