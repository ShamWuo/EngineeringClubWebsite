'use client';

import React, { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Filter, Layers, ArrowUpDown, X } from 'lucide-react';
import { ENGINEERING_DISCIPLINES } from '@/lib/constants/competitions';

interface CompetitionFiltersProps {
  currentImpact: string;
  currentDiscipline: string;
  currentSort: string;
  currentQuery: string;
  totalCount: number;
  filteredCount: number;
}

export function CompetitionFilters({
  currentImpact,
  currentDiscipline,
  currentSort,
  currentQuery,
  totalCount,
  filteredCount,
}: CompetitionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();

    const nextImpact = updates.impact !== undefined ? updates.impact : currentImpact;
    const nextDiscipline = updates.discipline !== undefined ? updates.discipline : currentDiscipline;
    const nextSort = updates.sort !== undefined ? updates.sort : currentSort;
    const nextQ = updates.q !== undefined ? updates.q : currentQuery;

    if (nextImpact && nextImpact !== 'all') params.set('impact', nextImpact);
    if (nextDiscipline && nextDiscipline !== 'all') params.set('discipline', nextDiscipline);
    if (nextSort && nextSort !== 'people') params.set('sort', nextSort);
    if (nextQ && nextQ.trim()) params.set('q', nextQ.trim());

    const qs = params.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    });
  };

  const hasActiveFilters =
    (currentImpact && currentImpact !== 'all') ||
    (currentDiscipline && currentDiscipline !== 'all') ||
    (currentSort && currentSort !== 'people') ||
    Boolean(currentQuery);

  const handleClearAll = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
        {/* Search input */}
        <div className="sm:col-span-2 lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="search"
            defaultValue={currentQuery}
            placeholder="Search competitions, organizers, tags…"
            onChange={(e) => {
              const value = e.target.value;
              updateFilters({ q: value.trim() ? value : null });
            }}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 transition-colors shadow-2xs"
          />
        </div>

        {/* Impact Level Dropdown Filter */}
        <div className="sm:col-span-1 lg:col-span-3 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <select
            value={currentImpact}
            onChange={(e) => updateFilters({ impact: e.target.value })}
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 transition-colors shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Impact Levels</option>
            <option value="world">🌍 World Championship</option>
            <option value="national">⭐ National</option>
            <option value="regional">📍 Regional</option>
            <option value="local">🏠 Local / Club</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-3xs">
            ▼
          </div>
        </div>

        {/* Engineering Discipline Dropdown Filter */}
        <div className="sm:col-span-1 lg:col-span-3 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <Layers className="h-3.5 w-3.5" />
          </div>
          <select
            value={currentDiscipline}
            onChange={(e) => updateFilters({ discipline: e.target.value })}
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 transition-colors shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Engineering Disciplines</option>
            {ENGINEERING_DISCIPLINES.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-3xs">
            ▼
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="sm:col-span-2 lg:col-span-2 relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </div>
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500 transition-colors shadow-2xs appearance-none cursor-pointer font-medium"
          >
            <option value="people">Most Participants (Default)</option>
            <option value="impact">Impact Level</option>
            <option value="deadline">Next Deadline</option>
            <option value="event">Event Date</option>
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-3xs">
            ▼
          </div>
        </div>
      </div>

      {/* Active filter counter & clear action */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <p className="text-2xs text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-semibold text-zinc-900 dark:text-white">{filteredCount}</span> of {totalCount} open competitions
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-2xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
