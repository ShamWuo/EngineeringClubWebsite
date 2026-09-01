import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { FundingNewForm } from './funding-form';
import { DollarSign, ArrowLeft } from 'lucide-react';

export default async function NewFundingRequestPage() {
  const user = await requireUser();
  const db = getDb();

  const myTeamMemberships = db.team_members.filter((m) => m.user_id === user.id);
  const myTeams = myTeamMemberships.map((m) => db.teams.find((t) => t.id === m.team_id)).filter(Boolean);
  const competitions = db.competitions.filter((c) => c.status === 'active' || c.status === 'planned');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/funding"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to funding requests
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-emerald-600" />
          New Funding Procurement Request
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Build an itemized budget request with exact parts, vendors, and quantities. Officers review all requests against club allocation budgets.
        </p>
      </div>

      <FundingNewForm
        teams={myTeams as any}
        competitions={competitions}
      />
    </div>
  );
}
