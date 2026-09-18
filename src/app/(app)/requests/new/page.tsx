import React, { Suspense } from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getCompetitions, getAdminProfiles, getTeams } from '@/lib/db/queries';
import { UniversalRequestForm } from './universal-request-form';

export const metadata = {
  title: 'Submit Request — FHS Engineering',
  description: 'Submit competition proposals, funding requests, subteams, workshops, or equipment access.',
};

export default async function NewRequestPage() {
  const user = await requireRole(['member', 'officer', 'admin']);

  const [competitionsData, profilesData, teamsData] = await Promise.all([
    getCompetitions(),
    getAdminProfiles(),
    getTeams(),
  ]);

  const competitions = competitionsData
    .filter((c) => c.status === 'active' || c.status === 'planned')
    .map((c) => ({ id: c.id, name: c.name }));

  const userTeams = teamsData.map((t) => ({
    id: t.id,
    name: t.name,
    competitionName: t.competition?.name || 'General',
  }));

  const members = profilesData.filter((p) => p.is_active && p.id !== user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Submit a Club Request
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Select what you need below. Submissions are immediately routed to the officer review queue.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Loading request builder...</div>}>
        <UniversalRequestForm
          competitions={competitions}
          teams={userTeams}
          members={members}
        />
      </Suspense>
    </div>
  );
}
