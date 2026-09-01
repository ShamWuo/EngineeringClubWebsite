import React from 'react';
import { ExternalLink, ChevronDown, MessageSquare, Key, ShieldAlert, Github, Printer, ShoppingBag, Calendar, FileText, Compass, Link as LinkIcon } from 'lucide-react';
import type { Database } from '@/lib/db/types';

type LinkRow = Database['public']['Tables']['links']['Row'];

const iconMap: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare className="h-5 w-5" />,
  Key: <Key className="h-5 w-5" />,
  ShieldAlert: <ShieldAlert className="h-5 w-5" />,
  Github: <Github className="h-5 w-5" />,
  Printer: <Printer className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Compass: <Compass className="h-4 w-4" />,
};

export function getLinkIcon(iconName: string | null, className?: string) {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return <LinkIcon className={className || "h-4 w-4"} />;
}

export function TieredLinksGrid({ links }: { links: LinkRow[] }) {
  const activeLinks = links.filter((l) => l.is_active);
  const primaryLinks = activeLinks.filter((l) => l.tier === 'primary').sort((a, b) => a.sort_order - b.sort_order);
  const secondaryLinks = activeLinks.filter((l) => l.tier === 'secondary').sort((a, b) => a.sort_order - b.sort_order);
  const resourceLinks = activeLinks.filter((l) => l.tier === 'resource').sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-8">
      {/* Tier 1: Primary Links (Prominent Brand Cards, max 4) */}
      {primaryLinks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Essential Club Hubs (Tier 1)
            </h2>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Pinned & Verified</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-start gap-4 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-sm hover:shadow-md hover:border-red-500/50 dark:hover:border-red-600 transition-all"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                  {getLinkIcon(link.icon, 'h-5 w-5')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    <span className="truncate">{link.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                  </div>
                  {link.description && (
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tier 2: Secondary Links (Compact Bordered Grid) */}
      {secondaryLinks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Quick Tools & Services (Tier 2)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {secondaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850 shadow-2xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400">
                    {getLinkIcon(link.icon, 'h-4 w-4')}
                  </span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-red-600 dark:group-hover:text-red-400">
                    {link.label}
                  </span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tier 3: Resource Links (Collapsible List) */}
      {resourceLinks.length > 0 && (
        <section>
          <details className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 transition-colors open:pb-5 shadow-2xs">
            <summary className="flex items-center justify-between cursor-pointer list-none select-none font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-500" />
                Additional Documents & Guides (Tier 3)
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/80 pt-2">
              {resourceLinks.map((link) => (
                <div key={link.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>{link.label}</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  {link.description && (
                    <span className="text-xs text-zinc-400 hidden sm:inline">{link.description}</span>
                  )}
                </div>
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}
