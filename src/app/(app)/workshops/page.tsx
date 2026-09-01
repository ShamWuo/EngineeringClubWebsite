import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getWorkshops } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  Video,
  Plus,
  CalendarCheck,
  Download,
} from 'lucide-react';
import { WorkshopRsvpButton } from './rsvp-button';

export default async function WorkshopsPage() {
  const user = await requireUser();
  const workshops = await getWorkshops();

  const supabase = await createClient();
  const [{ data: userRsvps }, { data: allRsvps }] = await Promise.all([
    (supabase.from('workshop_rsvps') as any).select('*').eq('user_id', user.id),
    (supabase.from('workshop_rsvps') as any).select('workshop_id'),
  ]);

  const myRsvps = new Set((userRsvps || []).map((r: any) => r.workshop_id));
  const rsvpCountMap = new Map<string, number>();
  (allRsvps || []).forEach((r: any) => {
    rsvpCountMap.set(r.workshop_id, (rsvpCountMap.get(r.workshop_id) || 0) + 1);
  });

  const upcoming = workshops.filter((w) => w.status === 'scheduled');
  const past = workshops.filter((w) => w.status === 'completed');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-red-600 dark:text-red-500" />
            Technical Workshops
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Build hands-on hardware and software competencies with peer-led and expert workshops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a href="/api/ics/workshops" download="workshops.ics">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 font-bold">
              <Download className="h-3.5 w-3.5" />
              Subscribe Calendar (.ics)
            </Button>
          </a>
          <Link href="/requests/new?type=workshop">
            <Button size="sm" className="font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs shadow-md shadow-red-950/40">
              <Plus className="h-4 w-4" />
              Request / Teach a Workshop
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Upcoming Workshops ({upcoming.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcoming.map((w) => {
            const rsvpCount = rsvpCountMap.get(w.id) || 0;
            const isRsvped = myRsvps.has(w.id);

            return (
              <Card key={w.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 shadow-2xs transition-all border-l-4 border-l-red-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant="info" className="text-3xs font-semibold">
                      {w.skill_level || 'All Levels'}
                    </Badge>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {rsvpCount} / {w.capacity || '∞'} RSVPs
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1 leading-snug text-zinc-900 dark:text-white">
                    {w.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {w.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2 border-t border-zinc-100 dark:border-zinc-850">
                    {w.starts_at && (
                      <span className="flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-200">
                        <Clock className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                        {new Date(w.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {new Date(w.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {w.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        {w.location}
                      </span>
                    )}
                  </div>
                  {w.instructor_name && (
                    <div className="text-2xs text-zinc-500">
                      Instructor: <strong className="font-semibold text-zinc-700 dark:text-zinc-300">{w.instructor_name}</strong>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between gap-3">
                  <Link href={`/workshops/${w.slug}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
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
        <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-850">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Past Workshop Materials & Recordings Archive
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((w) => (
              <Card key={w.id} className="p-4 flex flex-col justify-between bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status="completed" className="text-3xs" />
                    {w.starts_at && (
                      <span className="text-3xs text-zinc-400">
                        {new Date(w.starts_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">
                    {w.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 mb-3">
                    {w.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
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
                        <Video className="h-3 w-3 text-red-600 dark:text-red-500" /> Recording
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
