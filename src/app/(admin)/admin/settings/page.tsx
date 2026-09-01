import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { ClubSettingsEditor } from './settings-editor';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  await requireRole(['admin']);
  const db = getDb();
  const settings = db.club_settings;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          Club & Platform Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure domain registration policies, club branding, and annual procurement spend ceilings.
        </p>
      </div>

      <ClubSettingsEditor settings={settings} />
    </div>
  );
}
