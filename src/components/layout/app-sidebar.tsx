'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/button';
import { getLinkIcon } from '@/components/domain/tiered-links-grid';
import { StatusBadge } from '@/components/domain/status-badge';
import { NotificationBell } from '@/components/layout/notification-bell';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { ClubLogo } from '@/components/domain/club-logo';
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
  Cpu,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';
import type { UserRole, Database } from '@/lib/db/types';
import type { AuthUser } from '@/lib/supabase/server';

type LinkRow = Database['public']['Tables']['links']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface AppSidebarProps {
  currentUser: AuthUser;
  notifications?: NotificationRow[];
  clubName?: string;
  userRole?: UserRole;
  pendingReviewCount?: number;
  primaryLinks?: LinkRow[];
}

export function AppSidebar({
  currentUser,
  notifications = [],
  clubName,
  userRole = currentUser.role,
  pendingReviewCount = 0,
  primaryLinks = [],
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    { href: '/onboarding', label: 'Redo Onboarding', icon: RotateCcw },
  ];

  const sidebarNavContent = (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* Top Header & Scrollable Navigation Area */}
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Sidebar Brand Header */}
        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5 shrink-0">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2.5 group min-w-0"
          >
            <ClubLogo className="h-8 w-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm leading-tight text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                {clubName || 'Fairview High School Engineering'}
              </span>
              <span className="text-3xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">
                Members Portal
              </span>
            </div>
          </Link>

          {/* Quick Utility Actions (Notifications & Theme) */}
          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <NotificationBell notifications={notifications} />
              <span className="text-3xs font-semibold text-zinc-500 dark:text-zinc-400">Notifications</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable Nav Items */}
        <div className="overflow-y-auto px-3 py-3.5 space-y-5 flex-1">
          {/* Member Navigation */}
          <div>
            <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-1.5 font-mono">
              Club Spaces
            </div>
            <nav className="space-y-0.5">
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
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 font-semibold border-l-2 border-red-600'
                        : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Officer Management Navigation */}
          {isOfficer && (
            <div>
              <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between font-mono">
                <span>Officer Tools</span>
                <span className="text-3xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-1.5 py-0.2 rounded font-bold">
                  OFFICER
                </span>
              </div>
              <nav className="space-y-0.5">
                {officerNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 font-semibold border-l-2 border-red-600'
                          : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="flex h-4 px-1.5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-3xs shadow-xs ml-2 shrink-0">
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
              <div className="text-2xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between font-mono">
                <span>Admin Center</span>
                <span className="text-3xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 px-1.5 py-0.2 rounded font-bold">
                  ADMIN
                </span>
              </div>
              <nav className="space-y-0.5">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        isActive
                          ? 'bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 font-semibold border-l-2 border-red-600'
                          : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-red-600 dark:text-red-500' : 'text-zinc-400 dark:text-zinc-500'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Essential Club Hubs (Pinned Tier 1) */}
          {primaryLinks.length > 0 && (
            <div className="pt-3.5 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-2xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                  Essential Club Hubs
                </span>
              </div>
              <div className="space-y-1">
                {primaryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 shrink-0">
                        {getLinkIcon(link.icon, 'h-3.5 w-3.5')}
                      </span>
                      <span className="truncate">{link.label}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-zinc-400 dark:text-zinc-500 group-hover:text-red-600 dark:group-hover:text-red-400 opacity-60 group-hover:opacity-100 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name || 'User'}
                className="h-7 w-7 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-2xs shrink-0">
                {(currentUser.full_name || currentUser.email || 'U').substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 leading-tight truncate">
                {currentUser.full_name || currentUser.email}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <StatusBadge status={currentUser.role} className="text-3xs py-0 px-1.5" />
              </div>
            </div>
          </div>

          <UserMenu currentUser={currentUser} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-4 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 -ml-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <ClubLogo className="h-7 w-7" />
            <span className="font-bold text-xs text-zinc-900 dark:text-white truncate max-w-[180px]">
              {clubName || 'Fairview High School Engineering'}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell notifications={notifications} />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Sidebar Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarNavContent}
          </aside>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="w-64 lg:w-72 shrink-0 hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-screen sticky top-0 transition-colors z-30">
        {sidebarNavContent}
      </aside>
    </>
  );
}
