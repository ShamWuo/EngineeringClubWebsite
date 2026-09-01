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
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Send,
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-800 text-xs font-semibold text-red-300 shadow-md shadow-red-950/40">
          <Sparkles className="h-3.5 w-3.5 text-red-400" />
          <span>Fairview High School Engineering • 2026-27 Season</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Where Fairview Knights <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-400">
            Build The Future.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The centralized platform for Fairview High School engineering squads and robotics subteams. Join competition rosters, submit hardware funding and lab equipment requests, attend technical workshops, and launch projects.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 font-bold bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-950/60 text-xs">
              Sign In With Google / Email
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs">
              Enter Member Portal
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 text-left">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/70">
            <div className="text-2xl font-black text-red-500">{competitions.length}</div>
            <div className="text-xs text-zinc-400 font-medium">Major Competitions</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/70">
            <div className="text-2xl font-black text-zinc-100">{teamCount}</div>
            <div className="text-xs text-zinc-400 font-medium">Active Subteams</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/70">
            <div className="text-2xl font-black text-red-400">${(db.club_settings.budget_ceiling_cents / 100).toLocaleString()}</div>
            <div className="text-xs text-zinc-400 font-medium">Annual Project Budget</div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/70">
            <div className="text-2xl font-black text-zinc-200">{memberCount}</div>
            <div className="text-xs text-zinc-400 font-medium">Club Engineers</div>
          </div>
        </div>
      </section>

      {/* Competitions Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Active & Planned Competitions
            </h2>
            <p className="text-xs text-zinc-400">
              Join an existing squad, or propose a new challenge in the Request Center.
            </p>
          </div>
          <Link href="/competitions">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-zinc-400 hover:text-white">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitions.slice(0, 3).map((comp) => {
            const compTeams = db.teams.filter((t) => t.competition_id === comp.id);

            return (
              <Card key={comp.id} className="flex flex-col justify-between hover:border-red-600/50 bg-zinc-950 border-zinc-850 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-3xs font-mono bg-zinc-900 border-zinc-800 text-zinc-400">{comp.season || '2026-27'}</Badge>
                    <StatusBadge status={comp.status} />
                  </div>
                  <CardTitle className="text-base font-bold text-white line-clamp-1">{comp.name}</CardTitle>
                  <CardDescription className="text-xs text-zinc-400 line-clamp-2">
                    {comp.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      {compTeams.length} teams registered
                    </span>
                    {comp.organizer && <span className="truncate max-w-[120px]">{comp.organizer}</span>}
                  </div>
                  <Link href={`/competitions/${comp.slug}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800">
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
            <h2 className="text-2xl font-black text-white">
              Upcoming Technical Workshops
            </h2>
            <p className="text-xs text-zinc-400">
              Hands-on skill building in CAD, PCB design, FEA, embedded systems, and machine shop safety.
            </p>
          </div>
          <Link href="/workshops">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-zinc-400 hover:text-white">
              View All Workshops <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((w) => (
            <Card key={w.id} className="p-5 border-l-4 border-l-red-600 bg-zinc-950 border-zinc-850">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-sm text-white">{w.title}</h3>
                <span className="text-3xs font-mono font-bold text-red-400 bg-red-950/80 border border-red-900/60 px-2 py-0.5 rounded">{w.skill_level || 'All Levels'}</span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-4">
                {w.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-4">
                {w.starts_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-red-500" />
                    {new Date(w.starts_at).toLocaleDateString()}
                  </span>
                )}
                {w.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    {w.location}
                  </span>
                )}
              </div>
              <Link href={`/workshops/${w.slug}`}>
                <Button size="sm" className="w-full text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800">
                  RSVP & View Syllabus
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="rounded-2xl bg-gradient-to-r from-red-950 via-zinc-950 to-black border border-red-900/60 text-white p-8 sm:p-12 text-center space-y-4 shadow-2xl shadow-red-950/40">
        <h2 className="text-3xl font-black">Ready to build with us?</h2>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          Authenticate using your Google student account to access subteams, request parts & funding, and RSVP for workshops.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-950/60 text-xs">
              Sign In To Portal
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
