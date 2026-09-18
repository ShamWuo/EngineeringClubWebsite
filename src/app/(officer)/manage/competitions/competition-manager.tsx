'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/domain/status-badge';
import { ImpactBadge } from '@/components/domain/impact-badge';
import { upsertCompetition } from '@/actions/competitions';
import { Plus, Edit, X, Save } from 'lucide-react';
import type { Database, CompStatus, ImpactLevel } from '@/lib/db/types';

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
      impact_level: 'national',
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
        impact_level: (editingComp.impact_level as ImpactLevel) || 'national',
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
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-md">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
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
                <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Name *
                  </label>
                  <Input
                    required
                    value={editingComp.name || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Slug (URL Key) *
                  </label>
                  <Input
                    required
                    placeholder="e.g. first-robotics-2027"
                    value={editingComp.slug || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Impact Level
                  </label>
                  <Select
                    value={editingComp.impact_level || 'national'}
                    onChange={(e) => setEditingComp({ ...editingComp, impact_level: e.target.value as ImpactLevel })}
                  >
                    <option value="world">🌍 World Championship</option>
                    <option value="national">⭐ National</option>
                    <option value="regional">📍 Regional</option>
                    <option value="local">🏠 Local / In-House</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Season
                  </label>
                  <Input
                    value={editingComp.season || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, season: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Organizer
                  </label>
                  <Input
                    value={editingComp.organizer || ''}
                    onChange={(e) => setEditingComp({ ...editingComp, organizer: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={editingComp.description || ''}
                  onChange={(e) => setEditingComp({ ...editingComp, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-2xs uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
            <tr>
              <th className="py-3 px-4">Competition</th>
              <th className="py-3 px-4">Season</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Impact</th>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            {competitions.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                  {c.name}
                  <div className="text-3xs font-mono text-zinc-400 dark:text-zinc-500">/{c.slug}</div>
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{c.season || 'N/A'}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={c.status} className="text-3xs" />
                </td>
                <td className="py-3 px-4">
                  <ImpactBadge level={c.impact_level} className="text-3xs" />
                </td>
                <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400">{c.organizer || 'N/A'}</td>
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
