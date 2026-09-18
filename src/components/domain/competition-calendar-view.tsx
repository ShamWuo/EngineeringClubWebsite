'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Flag,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import type { Database } from '@/lib/db/types';

type CompetitionRow = Database['public']['Tables']['competitions']['Row'];

interface CalendarEvent {
  competitionId: string;
  competitionName: string;
  competitionSlug: string;
  status: string;
  type: 'deadline' | 'event' | 'open';
  label: string;
  date: Date;
}

interface CompetitionCalendarViewProps {
  competitions: CompetitionRow[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CompetitionCalendarView({ competitions }: CompetitionCalendarViewProps) {
  const today = useMemo(() => new Date(), []);

  // Determine initial month: today
  const [viewDate, setViewDate] = useState<Date>(() => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Extract all calendar events from competitions
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    const addEvent = (d: Date, evt: CalendarEvent) => {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = map.get(key) || [];
      existing.push(evt);
      map.set(key, existing);
    };

    competitions.forEach((comp) => {
      if (comp.registration_closes_at) {
        const d = new Date(comp.registration_closes_at);
        addEvent(d, {
          competitionId: comp.id,
          competitionName: comp.name,
          competitionSlug: comp.slug,
          status: comp.status,
          type: 'deadline',
          label: 'Registration Deadline',
          date: d,
        });
      }

      if (comp.event_starts_at) {
        const d = new Date(comp.event_starts_at);
        addEvent(d, {
          competitionId: comp.id,
          competitionName: comp.name,
          competitionSlug: comp.slug,
          status: comp.status,
          type: 'event',
          label: 'Competition Finals / Event',
          date: d,
        });
      }

      if (comp.registration_opens_at) {
        const d = new Date(comp.registration_opens_at);
        addEvent(d, {
          competitionId: comp.id,
          competitionName: comp.name,
          competitionSlug: comp.slug,
          status: comp.status,
          type: 'open',
          label: 'Registration Opens',
          date: d,
        });
      }
    });

    return map;
  }, [competitions]);

  // Calendar grid calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: {
      day: number;
      date: Date;
      isCurrentMonth: boolean;
      dateKey: string;
      events: CalendarEvent[];
    }[] = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        day: dayNum,
        date: d,
        isCurrentMonth: false,
        dateKey: key,
        events: eventsByDate.get(key) || [],
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: d,
        isCurrentMonth: true,
        dateKey: key,
        events: eventsByDate.get(key) || [],
      });
    }

    // Next month filler days to complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        date: d,
        isCurrentMonth: false,
        dateKey: key,
        events: eventsByDate.get(key) || [],
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex, daysInPrevMonth, eventsByDate]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Selected date key
  const selectedDateKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  const selectedEvents = selectedDateKey ? eventsByDate.get(selectedDateKey) || [] : [];

  const monthName = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-red-600 dark:text-red-500" />
          <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
            {monthName}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs font-semibold px-2.5"
          >
            Today
          </Button>
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 text-center text-3xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 py-2">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
        {calendarDays.map((item, idx) => {
          const isToday =
            item.date.getDate() === today.getDate() &&
            item.date.getMonth() === today.getMonth() &&
            item.date.getFullYear() === today.getFullYear();

          const isSelected = selectedDateKey === item.dateKey;
          const hasEvents = item.events.length > 0;

          return (
            <div
              key={`${item.dateKey}-${idx}`}
              onClick={() => {
                if (hasEvents) {
                  setSelectedDate(item.date);
                }
              }}
              className={`min-h-[75px] sm:min-h-[85px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                !item.isCurrentMonth
                  ? 'bg-zinc-50/40 dark:bg-zinc-950/30 text-zinc-400 dark:text-zinc-600'
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              } ${hasEvents ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60' : ''} ${
                isSelected ? 'ring-2 ring-inset ring-red-600' : ''
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold h-5 w-5 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : ''
                  }`}
                >
                  {item.day}
                </span>

                {hasEvents && (
                  <span className="text-3xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
                    {item.events.length}
                  </span>
                )}
              </div>

              {/* Event indicators / pills */}
              <div className="mt-1 space-y-1">
                {item.events.slice(0, 2).map((ev, i) => (
                  <div
                    key={`${ev.competitionId}-${i}`}
                    className={`px-1.5 py-0.5 rounded text-3xs font-semibold truncate border ${
                      ev.type === 'deadline'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-900'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                    }`}
                    title={`${ev.competitionName} - ${ev.label}`}
                  >
                    {ev.type === 'deadline' ? '⏳ ' : '🏆 '}
                    <span className="hidden sm:inline">{ev.competitionName.split(' ')[0]}</span>
                    <span className="sm:hidden">{ev.type === 'deadline' ? 'Due' : 'Event'}</span>
                  </div>
                ))}
                {item.events.length > 2 && (
                  <div className="text-3xs text-zinc-400 font-mono text-center">
                    +{item.events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Panel */}
      {selectedDate && selectedEvents.length > 0 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-red-600" />
              Events on {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-3xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-semibold"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedEvents.map((ev, i) => (
              <div
                key={`${ev.competitionId}-${i}`}
                className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-3xs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                        ev.type === 'deadline'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border-red-200 dark:border-red-900'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {ev.label}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                    {ev.competitionName}
                  </p>
                </div>

                <Link href={`/competitions/${ev.competitionSlug}`}>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2 gap-1 text-red-600 dark:text-red-400">
                    View
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
