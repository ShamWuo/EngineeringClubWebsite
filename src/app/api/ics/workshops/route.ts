import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mock-data';

function formatICSDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export async function GET() {
  const db = getDb();
  const workshops = db.workshops.filter((w) => w.status !== 'cancelled');

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Engineering Club//Workshops Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Engineering Club Workshops',
    'X-WR-TIMEZONE:UTC',
  ];

  workshops.forEach((w) => {
    const start = formatICSDate(w.starts_at);
    const end = formatICSDate(w.ends_at);
    if (!start) return;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${w.id}@engineering-club.org`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `DTSTART:${start}`,
      end ? `DTEND:${end}` : `DTEND:${start}`,
      `SUMMARY:${w.title.replace(/[,;]/g, '\\$&')}`,
      `DESCRIPTION:${(w.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&')}`,
      `LOCATION:${(w.location || 'Online').replace(/[,;]/g, '\\$&')}`,
      `STATUS:${w.status === 'scheduled' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  return new NextResponse(icsContent.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="workshops.ics"',
    },
  });
}
