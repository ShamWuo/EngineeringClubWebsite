'use client';

import React, { useTransition } from 'react';
import { switchDemoUser } from '@/actions/auth';
import { UserCheck, Sparkles } from 'lucide-react';
import type { AuthUser } from '@/lib/supabase/server';

interface PersonaSwitcherProps {
  currentUser: AuthUser;
}

const PERSONAS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alex Vance',
    role: 'admin',
    desc: 'Club President / Admin',
    color: 'bg-red-500',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Maya Lin',
    role: 'officer',
    desc: 'VP Operations / Officer',
    color: 'bg-brand-500',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Sam Rivera',
    role: 'member',
    desc: 'Powertrain Lead / Member',
    color: 'bg-emerald-500',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Jordan Chen',
    role: 'member',
    desc: 'Software Member',
    color: 'bg-blue-500',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Taylor Kim',
    role: 'member',
    desc: 'Aero Lead / Member',
    color: 'bg-purple-500',
  },
];

export function PersonaSwitcher({ currentUser }: PersonaSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetId = e.target.value;
    startTransition(async () => {
      await switchDemoUser({ userId: targetId });
    });
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="hidden sm:inline">Persona:</span>
      </div>
      <select
        value={currentUser.id}
        onChange={handleSelect}
        disabled={isPending}
        className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer py-0.5"
      >
        {PERSONAS.map((p) => (
          <option key={p.id} value={p.id} className="text-slate-900 bg-white dark:bg-slate-900">
            {p.name} ({p.role.toUpperCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
