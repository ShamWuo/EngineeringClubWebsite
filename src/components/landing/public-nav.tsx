"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Trophy, CalendarCheck, Users, Wrench, HelpCircle } from "lucide-react";

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/competitions", label: "Competitions", icon: Trophy },
    { href: "/workshops", label: "Workshops", icon: CalendarCheck },
    { href: "/#teams", label: "Teams", icon: Users },
    { href: "/#how-it-works", label: "How It Works", icon: Wrench },
    { href: "/#makerspace", label: "Makerspace", icon: Wrench },
    { href: "/#faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <>
      {/* Desktop Nav Links */}
      <nav className="hidden lg:flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Menu Button */}
      <div className="flex lg:hidden items-center">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileOpen && (
        <div className="absolute top-16 inset-x-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-xl py-4 px-4 lg:hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex flex-col space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <Icon className="h-4 w-4 text-zinc-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
