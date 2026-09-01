import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getLinks } from '@/lib/db/queries';
import { TieredLinksGrid } from '@/components/domain/tiered-links-grid';
import { Button } from '@/components/ui/button';
import { Link2, Settings } from 'lucide-react';

export default async function LinksPage() {
  const user = await requireUser();
  const links = await getLinks();
  const isOfficer = user.role === 'officer' || user.role === 'admin';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Link2 className="h-6 w-6 text-red-500" />
            Curated Club Links & Resources
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access essential software licenses, safety waivers, team Discord servers, and FHS school travel and equipment policies.
          </p>
        </div>

        {isOfficer && (
          <Link href="/manage/links">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800">
              <Settings className="h-3.5 w-3.5" />
              Manage Link Hierarchy
            </Button>
          </Link>
        )}
      </div>

      {/* 3-Tier Emphasized Links Grid */}
      <TieredLinksGrid links={links} />
    </div>
  );
}
