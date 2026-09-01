import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  Plus,
  CalendarCheck,
  Download,
  ExternalLink,
} from 'lucide-react';
import { WorkshopRsvpButton } from './rsvp-button';

export default async function WorkshopsPage() {
  const user = await requireUser();
  const db = getDb();

  const workshops = db.workshops;
  const upcoming = workshops.filter((w) => w.status === 'scheduled');
  const past = workshops.filter((w) => w.status === 'completed');

  const myRsvps = new Set(
    db.workshop_rsvps.filter((r) => r.user_id === user.id).map((r) => r.workshop_id)
  );

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-brand-600" />
            Technical Workshops
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build hands-on hardware and software competencies with peer-led and expert workshops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a href="/api/ics/workshops" download="workshops.ics">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-semibold">
              <Download className="h-3.5 w-3.5" />
              Subscribe Calendar (.ics)
            </Button>
          </a>
          <Link href="/workshops/request">
            <Button size="sm" className="font-semibold gap-1.5 shadow-xs">
              <Plus className="h-4 w-4" />
              Request / Teach a Workshop
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Upcoming Workshops ({upcoming.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcoming.map((w) => {
            const rsvpCount = db.workshop_rsvps.filter((r) => r.workshop_id === w.id).length;
            const isRsvped = myRsvps.has(w.id);

            return (
              <Card key={w.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-l-4 border-l-brand-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="info" className="text-3xs font-semibold">
                      {w.skill_level || 'All Levels'}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {rsvpCount} / {w.capacity || '∞'} RSVPs
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 leading-snug">
                    {w.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {w.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 border-t border-slate-100 dark:border-slate-800/80">
                    {w.starts_at && (
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                        {new Date(w.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(w.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {w.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {w.location}
                      </span>
                    )}
                  </div>
                  {w.instructor_name && (
                    <div className="text-2xs text-slate-500">
                      Instructor: <strong className="font-semibold text-slate-700 dark:text-slate-300">{w.instructor_name}</strong>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <Link href={`/workshops/${w.slug}`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Details & Syllabus →
                    </Button>
                  </Link>
                  <WorkshopRsvpButton
                    workshopId={w.id}
                    isRsvped={isRsvped}
                    isFull={w.capacity ? rsvpCount >= w.capacity : false}
                  />
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Past Workshops & Materials Archive */}
      {past.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Past Workshop Materials & Recordings Archive
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((w) => (
              <Card key={w.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status="completed" className="text-3xs" />
                    {w.starts_at && (
                      <span className="text-3xs text-slate-400">
                        {new Date(w.starts_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                    {w.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
                    {w.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {w.materials_url && (
                    <a href={w.materials_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full h-7 text-2xs gap-1">
                        <FileText className="h-3 w-3" /> Materials
                      </Button>
                    </a>
                  )}
                  {w.recording_url && (
                    <a href={w.recording_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full h-7 text-2xs gap-1">
                        <Video className="h-3 w-3 text-red-500" /> Recording
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
