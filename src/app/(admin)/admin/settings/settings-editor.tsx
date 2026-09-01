'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateClubSettings } from '@/actions/admin';
import { Save, CheckCircle2 } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type SettingsRow = Database['public']['Tables']['club_settings']['Row'];

export function ClubSettingsEditor({ settings }: { settings: SettingsRow }) {
  const [clubName, setClubName] = useState(settings.club_name);
  const [domain, setDomain] = useState(settings.allowed_email_domain);
  const [budgetCeiling, setBudgetCeiling] = useState(
    (settings.budget_ceiling_cents / 100).toString()
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const res = await updateClubSettings({
        club_name: clubName.trim(),
        allowed_email_domain: domain.trim(),
        budget_ceiling_cents: Math.round(parseFloat(budgetCeiling || '0') * 100),
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSave}>
        <CardContent className="pt-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Club settings updated successfully!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Club / Organization Name *
            </label>
            <Input
              required
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Allowed School Email Domain *
            </label>
            <Input
              required
              placeholder="bvsd.org"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <span className="text-3xs text-slate-400 mt-1 block">
              Only student emails ending in @{domain} will be allowed to authenticate without admin invite.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Annual Project Budget Ceiling ($) *
            </label>
            <Input
              type="number"
              min="0"
              required
              value={budgetCeiling}
              onChange={(e) => setBudgetCeiling(e.target.value)}
            />
            <span className="text-3xs text-slate-400 mt-1 block">
              Triggers a warning indicator in the officer portal if approved funding exceeds 80% of this limit.
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button
            type="submit"
            disabled={isPending || !clubName.trim() || !domain.trim()}
            size="sm"
            className="font-semibold gap-1.5"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saving...' : 'Save Club Settings'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
