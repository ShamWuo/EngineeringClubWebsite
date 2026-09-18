'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, X, User, Check, Users } from 'lucide-react';

export interface RegisteredMember {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  skills?: string[];
  role?: string;
}

export interface MemberSearchMultiSelectProps {
  members?: RegisteredMember[];
  availableMembers?: RegisteredMember[];
  selectedMemberIds: string[];
  onChange?: (ids: string[]) => void;
  onSelectionChange?: (ids: string[]) => void;
  currentUserId?: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
}

export function MemberSearchMultiSelect({
  members: membersProp,
  availableMembers: availableMembersProp,
  selectedMemberIds,
  onChange,
  onSelectionChange,
  currentUserId,
  placeholder = 'Search registered club members by name or email...',
  label = 'Add Team Members',
  helperText,
}: MemberSearchMultiSelectProps) {
  const members = membersProp || availableMembersProp || [];
  const handleChange = (ids: string[]) => {
    onChange?.(ids);
    onSelectionChange?.(ids);
  };
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available members: exclude creator and already selected members
  const availableMembers = members.filter((m) => {
    if (currentUserId && m.id === currentUserId) return false;
    if (selectedMemberIds.includes(m.id)) return false;

    if (!query.trim()) return true;

    const q = query.trim().toLowerCase();
    const nameMatch = (m.full_name || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const skillMatch = (m.skills || []).some((s) => s.toLowerCase().includes(q));
    return nameMatch || emailMatch || skillMatch;
  });

  // Selected member objects
  const selectedMembers = members.filter((m) => selectedMemberIds.includes(m.id));

  const handleSelect = (memberId: string) => {
    if (!selectedMemberIds.includes(memberId)) {
      handleChange([...selectedMemberIds, memberId]);
    }
    setQuery('');
    setIsOpen(true);
  };

  const handleRemove = (memberId: string) => {
    handleChange(selectedMemberIds.filter((id) => id !== memberId));
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {label} ({selectedMemberIds.length} added)
        </label>
        <span className="text-3xs text-zinc-400 dark:text-zinc-500">
          Registered club members
        </span>
      </div>
      {helperText && (
        <p className="text-3xs text-zinc-500 dark:text-zinc-400 -mt-1">
          {helperText}
        </p>
      )}

      {/* Selected Members Badges/Chips */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 max-h-36 overflow-y-auto">
          {selectedMembers.map((m) => (
            <div
              key={m.id}
              className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs shadow-xs group"
            >
              <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center text-3xs font-bold shrink-0">
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt={m.full_name || m.email}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <span>{(m.full_name || m.email)[0].toUpperCase()}</span>
                )}
              </div>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs truncate max-w-[140px]">
                {m.full_name || m.email}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                className="h-4 w-4 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center justify-center transition-colors cursor-pointer"
                title={`Remove ${m.full_name || m.email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input with Dropdown */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-9 h-10 text-xs bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 rounded-xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/10 backdrop-blur-lg divide-y divide-zinc-100 dark:divide-zinc-800/80 animate-in fade-in-50 zoom-in-95 duration-150">
            {availableMembers.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                {query.trim()
                  ? `No registered members match "${query}"`
                  : 'All available club members have already been added.'}
              </div>
            ) : (
              availableMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m.id)}
                  className="w-full text-left p-2.5 flex items-center justify-between hover:bg-red-50/60 dark:hover:bg-red-950/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.full_name || m.email}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <span>{(m.full_name || m.email)[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                          {m.full_name || m.email}
                        </span>
                        {m.role && m.role !== 'member' && (
                          <Badge variant="outline" className="text-4xs px-1.5 py-0 uppercase font-mono">
                            {m.role}
                          </Badge>
                        )}
                      </div>
                      <p className="text-3xs text-zinc-400 dark:text-zinc-500 truncate">
                        {m.email}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      <UserPlus className="h-3.5 w-3.5" />
                      Add
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
