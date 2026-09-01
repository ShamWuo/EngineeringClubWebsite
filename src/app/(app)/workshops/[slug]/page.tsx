import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getWorkshopBySlug } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/domain/status-badge';
import { WorkshopRsvpButton } from '../rsvp-button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  ArrowLeft,
} from 'lucide-react';

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;

  const result = await getWorkshopBySlug(slug);
  if (!result) {
    notFound();
  }

  const workshop = result.workshop;
  const rsvps = result.rsvps;
  const isRsvped = rsvps.some((r) => r.user_id === user.id);
  const isFull = workshop.capacity ? rsvps.length >= workshop.capacity : false;

  const supabase = await createClient();
  const userIds = rsvps.map((r) => r.user_id);
  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from('profiles').select('*').in('id', userIds);
    profiles = data || [];
  }
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const attendeeProfiles = rsvps.map((r) => {
    const profile = profileMap.get(r.user_id);
    return {
      ...r,
      full_name: profile?.full_name || null,
      email: profile?.email || 'FHS Student',
      avatar_url: profile?.avatar_url || null,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to workshops
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="info" className="text-3xs font-semibold">
                {workshop.skill_level || 'All Levels'}
              </Badge>
              <StatusBadge status={workshop.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {workshop.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <WorkshopRsvpButton
              workshopId={workshop.id}
              isRsvped={isRsvped}
              isFull={isFull}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white">Workshop Overview & Syllabus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {workshop.description || 'No detailed syllabus provided.'}
              </p>

              {(workshop.materials_url || workshop.recording_url) && (
                <div className="pt-4 border-t border-zinc-850 flex flex-wrap gap-3">
                  {workshop.materials_url && (
                    <a href={workshop.materials_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold bg-zinc-900 border-zinc-800 text-zinc-300">
                        <FileText className="h-4 w-4" />
                        Download Slides & Files
                      </Button>
                    </a>
                  )}
                  {workshop.recording_url && (
                    <a href={workshop.recording_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold text-red-400 border-red-900 bg-red-950/20">
                        <Video className="h-4 w-4" />
                        Watch Session Recording
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendee list */}
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-red-500" />
                Registered Members ({rsvps.length} {workshop.capacity ? `/ ${workshop.capacity}` : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendeeProfiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  No members have RSVP'd yet. Be the first to register!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attendeeProfiles.map((att) => (
                    <div
                      key={att.user_id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-zinc-850 bg-zinc-900/40 text-xs"
                    >
                      {att.avatar_url ? (
                        <img
                          src={att.avatar_url}
                          alt="Avatar"
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-red-950 text-red-400 font-bold flex items-center justify-center text-3xs border border-red-800">
                          {(att.full_name || att.email).substring(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-200 truncate">
                          {att.full_name || att.email}
                        </div>
                        <div className="text-3xs text-zinc-500 truncate">{att.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-zinc-950 border-zinc-850">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-white">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {workshop.starts_at && (
                <div className="flex items-start justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Date & Time</span>
                  <span className="font-semibold text-zinc-200 text-right">
                    {new Date(workshop.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    <br />
                    {new Date(workshop.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {workshop.location && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Location</span>
                  <span className="font-semibold text-zinc-200">{workshop.location}</span>
                </div>
              )}
              {workshop.instructor_name && (
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-850">
                  <span className="text-zinc-500">Instructor</span>
                  <span className="font-semibold text-red-400">{workshop.instructor_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-zinc-500">Max Capacity</span>
                <span className="font-semibold text-zinc-200">
                  {workshop.capacity ? `${workshop.capacity} seats` : 'Open / Unlimited'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
