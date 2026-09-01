import { NextResponse } from 'next/server';
import { getWorkshops } from '@/lib/db/queries';

function formatICSDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export async function GET() {
  const allWorkshops = await getWorkshops();
  const workshops = allWorkshops.filter((w) => w.status !== 'cancelled');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fairview High School Engineering Club//Workshops Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FHS Engineering Workshops',
    'X-WR-TIMEZONE:UTC',
  ];

  workshops.forEach((w) => {
    const start = formatICSDate(w.starts_at);
    const end = formatICSDate(w.ends_at);
    if (!start) return;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${w.id}@fairview-engineering.bvsd.org`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `DTSTART:${start}`,
      end ? `DTEND:${end}` : `DTEND:${start}`,
      `SUMMARY:${w.title.replace(/[,;]/g, '\\$&')}`,
      `DESCRIPTION:${(w.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&')}`,
      `LOCATION:${(w.location || 'FHS Makerspace').replace(/[,;]/g, '\\$&')}`,
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
