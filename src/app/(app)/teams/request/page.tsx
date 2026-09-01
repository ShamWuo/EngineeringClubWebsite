import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { TeamRequestForm } from './request-form';
import { ArrowLeft, Users } from 'lucide-react';

export default async function TeamRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>;
}) {
  const user = await requireUser();
  const db = getDb();
  const params = await searchParams;
  const prefilledCompId = params.competition;

  const competitions = db.competitions.filter((c) => c.status !== 'completed' && c.status !== 'cancelled');
  const members = db.profiles.filter((p) => p.is_active && p.id !== user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to competitions
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="h-6 w-6 text-brand-600" />
          Submit Team Proposal Form
        </h1>
        <p className="text-xs text-slate-500 mt-1">
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
