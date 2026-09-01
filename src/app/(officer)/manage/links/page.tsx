import React from 'react';
import { requireRole } from '@/lib/auth/require-role';
import { getLinks } from '@/lib/db/queries';
import { LinkManager } from './link-manager';
import { Link2 } from 'lucide-react';

export default async function ManageLinksPage() {
  await requireRole(['officer', 'admin']);
  const links = await getLinks();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Link2 className="h-6 w-6 text-red-500" />
          Manage Link Directory & Hierarchy
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure external resources, Discord links, and CAD keys. Assign tiers (Tier 1 Primary is strictly capped at 4 items).
        </p>
      </div>

      <LinkManager links={links} />
    </div>
  );
}
