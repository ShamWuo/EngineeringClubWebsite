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
  Send,
  Link2,
  Inbox,
  Settings,
  Users,
  Shield,
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
    { href: '/requests', label: 'Request Center', icon: Send },
    { href: '/links', label: 'Links Directory', icon: Link2 },
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
    { href: '/manage/links', label: 'Manage Links', icon: Link2 },
  ];

  const adminNav = [
    { href: '/admin/members', label: 'Member Roles', icon: Shield },
    { href: '/admin/settings', label: 'Club Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-850 bg-white dark:bg-black min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors">
      <div className="space-y-6">
        {/* Member Navigation */}
        <div>
          <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-2 font-mono">
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
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs dark:bg-red-950/70 dark:text-red-400 dark:border-red-800/80 dark:shadow-md dark:shadow-red-950/40'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Officer Management Navigation */}
        {isOfficer && (
          <div>
            <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between font-mono">
              <span>Officer Tools</span>
              <span className="text-3xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-1.5 py-0.2 rounded font-bold">
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
                      'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs dark:bg-red-950/70 dark:text-red-400 dark:border-red-800/80 dark:shadow-md dark:shadow-red-950/40'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="flex h-4 px-1.5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-3xs shadow-xs">
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
            <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3 mb-2 flex items-center justify-between font-mono">
              <span>Admin Center</span>
              <span className="text-3xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-1.5 py-0.2 rounded font-bold">
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
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200 shadow-xs dark:bg-red-950/70 dark:text-red-400 dark:border-red-800/80 dark:shadow-md dark:shadow-red-950/40'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    />
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
        <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-850">
          <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-2 font-mono">
            Pinned Hubs (Tier 1)
          </div>
          <div className="space-y-1">
            {primaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-red-600 dark:hover:text-red-400 transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-red-600 dark:text-red-500 shrink-0">
                    {getLinkIcon(link.icon, 'h-3.5 w-3.5')}
                  </span>
                  <span className="truncate">{link.label}</span>
                </div>
                <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-600 group-hover:text-red-600 dark:group-hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
