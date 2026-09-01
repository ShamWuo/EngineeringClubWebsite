import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/domain/status-badge';
import { Trophy, Plus, Edit } from 'lucide-react';
import { CompetitionManager } from './competition-manager';

export default async function ManageCompetitionsPage() {
  await requireRole(['officer', 'admin']);
  const db = getDb();
  const competitions = db.competitions;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-brand-600" />
          Manage Competitions & Seasons
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create, edit, and archive club-sponsored competition challenges. Set registration deadlines and team limits.
        </p>
      </div>

      <CompetitionManager competitions={competitions} />
    </div>
  );
}
