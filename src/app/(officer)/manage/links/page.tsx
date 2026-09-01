import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { LinkManager } from './link-manager';
import { Link2 } from 'lucide-react';

export default async function ManageLinksPage() {
  await requireRole(['officer', 'admin']);
  const db = getDb();
  const links = db.links;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Link2 className="h-6 w-6 text-brand-600" />
          Manage Link Directory & Hierarchy
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure external resources, Discord links, and CAD keys. Assign tiers (Tier 1 Primary is strictly capped at 4 items).
        </p>
      </div>

      <LinkManager links={links} />
    </div>
  );
}
