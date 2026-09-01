import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
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
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const db = getDb();
  const { slug } = await params;

  const workshop = db.workshops.find((w) => w.slug === slug);
  if (!workshop) {
    notFound();
  }

  const rsvps = db.workshop_rsvps.filter((r) => r.workshop_id === workshop.id);
  const isRsvped = rsvps.some((r) => r.user_id === user.id);
  const isFull = workshop.capacity ? rsvps.length >= workshop.capacity : false;

  const attendeeProfiles = rsvps.map((r) => {
    const profile = db.profiles.find((p) => p.id === r.user_id);
    return {
      ...r,
      full_name: profile?.full_name || null,
      email: profile?.email || 'Unknown',
      avatar_url: profile?.avatar_url || null,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3"
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Workshop Overview & Syllabus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {workshop.description || 'No detailed syllabus provided.'}
              </p>

              {(workshop.materials_url || workshop.recording_url) && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                  {workshop.materials_url && (
                    <a href={workshop.materials_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                        <FileText className="h-4 w-4" />
                        Download Slides & Files
                      </Button>
                    </a>
                  )}
                  {workshop.recording_url && (
                    <a href={workshop.recording_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold text-red-600 border-red-200">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-brand-600" />
                Registered Members ({rsvps.length} {workshop.capacity ? `/ ${workshop.capacity}` : ''})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendeeProfiles.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No members have RSVP'd yet. Be the first to register!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attendeeProfiles.map((att) => (
                    <div
                      key={att.user_id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                    >
                      {att.avatar_url ? (
                        <img
                          src={att.avatar_url}
                          alt="Avatar"
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-3xs">
                          {(att.full_name || att.email).substring(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {att.full_name || att.email}
                        </div>
                        <div className="text-3xs text-slate-400 truncate">{att.email}</div>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {workshop.starts_at && (
                <div className="flex items-start justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Date & Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {new Date(workshop.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    <br />
                    {new Date(workshop.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {workshop.location && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{workshop.location}</span>
                </div>
              )}
              {workshop.instructor_name && (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Instructor</span>
                  <span className="font-semibold text-brand-600">{workshop.instructor_name}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Max Capacity</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
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
