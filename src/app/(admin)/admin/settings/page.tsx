import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getClubSettings } from '@/lib/db/queries';
import { ClubSettingsEditor } from './settings-editor';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  await requireRole(['admin']);
  const settings = await getClubSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-red-500" />
          Club & Platform Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure domain registration policies, club branding, and annual procurement spend ceilings.
        </p>
      </div>

      <ClubSettingsEditor settings={settings} />
    </div>
  );
}
