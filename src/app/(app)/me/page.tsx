import React from 'react';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { ProfileEditor } from './profile-editor';
import { UserCheck } from 'lucide-react';

export default async function ProfilePage() {
  const user = await requireUser();
  const db = getDb();
  const profile = db.profiles.find((p) => p.id === user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <UserCheck className="h-6 w-6 text-brand-600" />
          My Member Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your skills, contact preferences, and graduation year for team matchmaking.
        </p>
      </div>

      {profile && <ProfileEditor profile={profile} />}
    </div>
  );
}
