import React from 'react';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/require-role';
import { getDb } from '@/lib/db/mock-data';
import { TieredLinksGrid } from '@/components/domain/tiered-links-grid';
import { Button } from '@/components/ui/button';
import { Link2, Settings, ExternalLink } from 'lucide-react';

export default async function LinksPage() {
  const user = await requireUser();
  const db = getDb();
  const isOfficer = user.role === 'officer' || user.role === 'admin';

  const links = db.links;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Link2 className="h-6 w-6 text-brand-600" />
            Curated Club Links & Resources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access essential software licenses, safety waivers, team Discord servers, and FHS school travel and equipment policies.
          </p>
        </div>

        {isOfficer && (
          <Link href="/manage/links">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
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
