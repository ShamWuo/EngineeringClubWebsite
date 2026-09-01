'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/domain/status-badge';
import { upsertLink, deleteLink } from '@/actions/links';
import { Plus, Edit, Trash2, X, Save, AlertTriangle, ExternalLink } from 'lucide-react';
import type { Database, LinkTier } from '@/lib/db/types';

type LinkRow = Database['public']['Tables']['links']['Row'];

export function LinkManager({ links }: { links: LinkRow[] }) {
  const [editingLink, setEditingLink] = useState<Partial<LinkRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activePrimaryCount = links.filter((l) => l.tier === 'primary' && l.is_active).length;

  const handleStartCreate = () => {
    setEditingLink({
      id: undefined,
      label: '',
      url: '',
      description: '',
      tier: 'secondary',
      icon: 'Link',
      sort_order: links.length + 1,
      is_active: true,
    });
    setError(null);
  };

  const handleStartEdit = (link: LinkRow) => {
    setEditingLink({ ...link });
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink || !editingLink.label || !editingLink.url) return;

    setError(null);
    startTransition(async () => {
      const res = await upsertLink({
        id: editingLink.id,
        label: editingLink.label!,
        url: editingLink.url!,
        description: editingLink.description || null,
        tier: (editingLink.tier as LinkTier) || 'secondary',
        icon: editingLink.icon || null,
        sort_order: editingLink.sort_order ?? 0,
        is_active: editingLink.is_active ?? true,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setEditingLink(null);
      }
    });
  };

  const handleDelete = (id: string, label: string) => {
    if (!confirm(`Delete link "${label}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteLink({ id });
      if (!res.ok) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tier 1 Primary Slots:
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              activePrimaryCount >= 4
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {activePrimaryCount} / 4 used
          </span>
        </div>

        <Button onClick={handleStartCreate} size="sm" className="font-semibold gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" />
          Add New Link
        </Button>
      </div>

      {editingLink && (
        <Card className="border-brand-300 dark:border-brand-800 shadow-md">
          <form onSubmit={handleSave}>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">
                {editingLink.id ? 'Edit Link' : 'Add New Link'}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingLink(null)}
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
                    Link Label *
                  </label>
                  <Input
                    required
                    value={editingLink.label || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination URL *
                  </label>
                  <Input
                    type="url"
                    required
                    placeholder="https://..."
                    value={editingLink.url || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hierarchy Tier *
                  </label>
                  <Select
                    value={editingLink.tier || 'secondary'}
                    onChange={(e) => setEditingLink({ ...editingLink, tier: e.target.value as LinkTier })}
                  >
                    <option value="primary">Tier 1: Primary (Max 4, Big Cards)</option>
                    <option value="secondary">Tier 2: Secondary (Compact Card)</option>
                    <option value="resource">Tier 3: Resource (Document List)</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Icon Name (Lucide)
                  </label>
                  <Input
                    placeholder="MessageSquare, Key, ShieldAlert, Github..."
                    value={editingLink.icon || ''}
                    onChange={(e) => setEditingLink({ ...editingLink, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sort Order Number
                  </label>
                  <Input
                    type="number"
                    value={editingLink.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, sort_order: parseInt(e.target.value || '0', 10) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description (Displayed on Tier 1 Primary Cards)
                </label>
                <Textarea
                  rows={2}
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="link_active"
                  checked={editingLink.is_active ?? true}
                  onChange={(e) => setEditingLink({ ...editingLink, is_active: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="link_active" className="text-xs text-slate-700 dark:text-slate-300">
                  Link is actively visible on portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingLink(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending} className="gap-1 font-semibold">
                  <Save className="h-4 w-4" />
                  {isPending ? 'Saving...' : 'Save Link'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Links List Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b text-2xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Label & URL</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Icon</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
            {links
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">#{l.sort_order}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{l.label}</div>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-3xs text-brand-600 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-xs">{l.url}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={l.tier} className="text-3xs" />
                  </td>
                  <td className="py-3 px-4 font-mono text-3xs text-slate-500">{l.icon || '—'}</td>
                  <td className="py-3 px-4">
                    {l.is_active ? (
                      <span className="text-3xs font-bold text-emerald-600">Active</span>
                    ) : (
                      <span className="text-3xs text-slate-400">Hidden</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(l)}
                      className="h-7 text-xs gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(l.id, l.label)}
                      disabled={isPending}
                      className="h-7 text-xs gap-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
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
