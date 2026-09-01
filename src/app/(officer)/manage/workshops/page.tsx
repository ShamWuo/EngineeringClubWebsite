import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getWorkshops, getAdminProfiles } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { WorkshopManager } from './workshop-manager';
import { CalendarCheck } from 'lucide-react';

export default async function ManageWorkshopsPage() {
  await requireRole(['officer', 'admin']);
  const supabase = await createClient();

  const [workshops, { data: rsvps }, profiles] = await Promise.all([
    getWorkshops(),
    supabase.from('workshop_rsvps').select('*'),
    getAdminProfiles(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <CalendarCheck className="h-6 w-6 text-red-500" />
          Manage Workshops & Attendance
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Schedule technical sessions, update syllabus/materials, and verify member attendance for certification.
        </p>
      </div>

      <WorkshopManager
        workshops={workshops}
        rsvps={rsvps || []}
        profiles={profiles}
      />
    </div>
  );
}
