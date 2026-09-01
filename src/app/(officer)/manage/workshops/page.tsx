import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { WorkshopManager } from './workshop-manager';
import { CalendarCheck } from 'lucide-react';

export default async function ManageWorkshopsPage() {
  await requireRole(['officer', 'admin']);
  const db = getDb();

  const workshops = db.workshops;
  const rsvps = db.workshop_rsvps;
  const profiles = db.profiles;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-brand-600" />
          Manage Workshops & Attendance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Schedule technical sessions, update syllabus/materials, and verify member attendance for certification.
        </p>
      </div>

      <WorkshopManager
        workshops={workshops}
        rsvps={rsvps}
        profiles={profiles}
      />
    </div>
  );
}
