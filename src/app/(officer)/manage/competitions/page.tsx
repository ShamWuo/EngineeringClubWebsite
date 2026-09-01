import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getCompetitions } from '@/lib/db/queries';
import { Trophy } from 'lucide-react';
import { CompetitionManager } from './competition-manager';

export default async function ManageCompetitionsPage() {
  await requireRole(['officer', 'admin']);
  const competitions = await getCompetitions();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-red-500" />
          Manage Competitions & Seasons
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Create, edit, and archive club-sponsored competition challenges. Set registration deadlines and team limits.
        </p>
      </div>

      <CompetitionManager competitions={competitions} />
    </div>
  );
}
