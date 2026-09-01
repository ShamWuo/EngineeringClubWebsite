'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/button';
import { getLinkIcon } from '@/components/domain/tiered-links-grid';
import {
  LayoutDashboard,
  Trophy,
  CalendarCheck,
  DollarSign,
  FileSpreadsheet,
  Link2,
  UserCheck,
  Inbox,
  Settings,
  Users,
  Wrench,
  Shield,
  Layers,
  ExternalLink,
} from 'lucide-react';
import type { UserRole, Database } from '@/lib/db/types';

type LinkRow = Database['public']['Tables']['links']['Row'];

interface AppSidebarProps {
  userRole: UserRole;
  pendingReviewCount?: number;
  primaryLinks?: LinkRow[];
}

export function AppSidebar({
  userRole,
  pendingReviewCount = 0,
  primaryLinks = [],
}: AppSidebarProps) {
  const pathname = usePathname();
  const isOfficer = userRole === 'officer' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  const memberNav = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/competitions', label: 'Competitions', icon: Trophy },
    { href: '/workshops', label: 'Workshops', icon: CalendarCheck },
    { href: '/funding', label: 'Funding', icon: DollarSign },
    { href: '/logs', label: 'Work Logs', icon: FileSpreadsheet },
    { href: '/links', label: 'Links Directory', icon: Link2 },
    { href: '/me', label: 'My Profile', icon: UserCheck },
  ];

  const officerNav = [
    {
      href: '/review',
      label: 'Review Queue',
      icon: Inbox,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { href: '/manage/competitions', label: 'Competitions', icon: Trophy },
    { href: '/manage/workshops', label: 'Workshops', icon: CalendarCheck },
    { href: '/manage/teams', label: 'Teams & Rosters', icon: Users },
    { href: '/manage/funding', label: 'Funding Spend', icon: DollarSign },
    { href: '/manage/links', label: 'Manage Links', icon: Link2 },
  ];

  const adminNav = [
    { href: '/admin/members', label: 'Member Roles', icon: Shield },
    { href: '/admin/settings', label: 'Club Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Member Navigation */}
        <div>
          <div className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Club Spaces
          </div>
          <nav className="space-y-1">
            {memberNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Officer Management Navigation */}
        {isOfficer && (
          <div>
            <div className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Officer Tools</span>
              <span className="text-3xs bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-1 rounded font-bold">
                OFFICER
              </span>
            </div>
            <nav className="space-y-1">
              {officerNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-2xs">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <div className="text-2xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Admin Center</span>
              <span className="text-3xs bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1 rounded font-bold">
                ADMIN
              </span>
            </div>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-red-600' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Pinned Tier 1 Essential Hubs Rail */}
      {primaryLinks.length > 0 && (
        <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Pinned Hubs (Tier 1)
          </div>
          <div className="space-y-1">
            {primaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-brand-600 dark:text-brand-400 shrink-0">
                    {getLinkIcon(link.icon, 'h-3.5 w-3.5')}
                  </span>
                  <span className="truncate">{link.label}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
