import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getWorkshopsICS } from '@/app/api/ics/workshops/route';
import { resetDb } from '@/lib/db/mock-data';

describe('API Route Handlers & Exports', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('GET /api/ics/workshops', () => {
    it('generates a valid RFC 5545 iCalendar feed with VCALENDAR and VEVENT', async () => {
      const response = await getWorkshopsICS();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/calendar');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="workshops.ics"');

      const text = await response.text();
      expect(text).toContain('BEGIN:VCALENDAR');
      expect(text).toContain('PRODID:-//Engineering Club//Workshops Calendar//EN');
      expect(text).toContain('BEGIN:VEVENT');
      expect(text).toContain('SUMMARY:Mastering Surface Modeling in SolidWorks');
      expect(text).toContain('END:VCALENDAR');
    });
  });
});
