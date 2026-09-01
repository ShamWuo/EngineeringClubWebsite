'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/domain/status-badge';
import { upsertCompetition } from '@/actions/competitions';
import { Plus, Edit, X, Save } from 'lucide-react';
import type { Database, CompStatus } from '@/lib/db/types';

type CompRow = Database['public']['Tables']['competitions']['Row'];

export function CompetitionManager({ competitions }: { competitions: CompRow[] }) {
  const [editingComp, setEditingComp] = useState<Partial<CompRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleStartCreate = () => {
    setEditingComp({
      id: undefined,
      slug: '',
      name: '',
      description: '',
      organizer: '',
      status: 'planned',
      season: '2026-27',
      entry_fee_cents: 0,
      max_teams: 2,
      max_team_size: 15,
      external_url: '',
    });
    setError(null);
  };

  const handleStartEdit = (comp: CompRow) => {
    setEditingComp({ ...comp });
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp || !editingComp.name || !editingComp.slug) return;

    setError(null);
    startTransition(async () => {
      const res = await upsertCompetition({
        id: editingComp.id,
        slug: editingComp.slug!,
        name: editingComp.name!,
        description: editingComp.description || null,
        organizer: editingComp.organizer || null,
        status: (editingComp.status as CompStatus) || 'planned',
        season: editingComp.season || '2026-27',
        entry_fee_cents: editingComp.entry_fee_cents || 0,
        max_teams: editingComp.max_teams || null,
        max_team_size: editingComp.max_team_size || null,
        external_url: editingComp.external_url || null,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setEditingComp(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleStartCreate} size="sm" className="font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          Add New Competition
        </Button>
      </div>

      {editingComp && (
        <Card className="border-brand-300 dark:border-brand-800 shadow-md">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingComp.id ? 'Edit Competition' : 'Create New Competition'}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingComp(null)}
                className="h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-xs rounded bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Name *
                  </label>
                  <Input
                    required
                    value={editingComp.name || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug (URL Key) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. formula-sae-2027"
                    value={editingComp.slug || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <Select
                    value={editingComp.status || 'planned'}
                    onChange={(e) => setEditingComp({ ...editingComp, status: e.target.value as CompStatus })}
                  >
                    <option value="idea">Idea</option>
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Season
                  </label>
                  <Input
                    value={editingComp.season || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, season: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Organizer
                  </label>
                  <Input
                    value={editingComp.organizer || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, organizer: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={editingComp.description || ''}
                  onChange={(e) => setEditingComp({ ...editingComp, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingComp(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending} className="gap-1 font-semibold">
                  <Save className="h-4 w-4" />
                  {isPending ? 'Saving...' : 'Save Competition'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Competitions Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b text-2xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Competition</th>
              <th className="py-3 px-4">Season</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {competitions.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                  {c.name}
                  <div className="text-3xs font-mono text-slate-400">/{c.slug}</div>
                </td>
                <td className="py-3 px-4">{c.season || 'N/A'}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={c.status} className="text-3xs" />
                </td>
                <td className="py-3 px-4 text-slate-500">{c.organizer || 'N/A'}</td>
                <td className="py-3 px-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(c)}
                    className="h-7 text-xs gap-1"
                  >
                    <Edit className="h-3 w-3" /> Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
