import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getCompetitions, getAdminProfiles } from '@/lib/db/queries';
import { TeamRequestForm } from './request-form';
import { ArrowLeft, Users } from 'lucide-react';

export default async function TeamRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>;
}) {
  const user = await requireUser();
  const [competitionsData, profilesData, params] = await Promise.all([
    getCompetitions(),
    getAdminProfiles(),
    searchParams,
  ]);

  const prefilledCompId = params.competition;
  const competitions = competitionsData.filter((c) => c.status !== 'completed' && c.status !== 'cancelled');
  const members = profilesData.filter((p) => p.is_active && p.id !== user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to competitions
        </Link>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-red-500" />
          Submit Team Proposal Form
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Form a new student engineering subteam for an approved club competition. When approved by officers, the team is automatically created and you are designated as the Team Lead.
        </p>
      </div>

      <TeamRequestForm
        competitions={competitions}
        members={members}
        prefilledCompId={prefilledCompId}
      />
    </div>
  );
}
