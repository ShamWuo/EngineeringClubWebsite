import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getWorkshopsICS } from '@/app/api/ics/workshops/route';
import { resetDb } from '@/lib/db/mock-data';

describe('API Route Handlers & Exports', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('GET /api/ics/workshops', () => {
    it('generates a valid RFC 5545 iCalendar feed with VCALENDAR and VEVENT', async () => {
      const db = resetDb();
      db.workshops.push({
        id: '50000001-1111-1111-1111-111111111111',
        slug: 'solidworks-advanced-surfacing',
        title: 'Mastering Surface Modeling in SolidWorks',
        description: 'Deep dive into complex boundary surfaces, lofts, tangency curvature continuity (G2), and ergonomic handheld enclosures.',
        instructor_id: null,
        instructor_name: 'Staff Instructor',
        status: 'scheduled',
        starts_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        ends_at: new Date(Date.now() + 3 * 86400000 + 7200000).toISOString(),
        location: 'FHS Makerspace & Zoom',
        capacity: 30,
        skill_level: 'Intermediate',
        materials_url: 'https://github.com/fhs-engineering/solidworks-workshop',
        recording_url: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const response = await getWorkshopsICS();
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/calendar');
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="workshops.ics"');

      const text = await response.text();
      expect(text).toContain('BEGIN:VCALENDAR');
      expect(text).toContain('PRODID:-//Fairview High School Engineering Club//Workshops Calendar//EN');
      expect(text).toContain('BEGIN:VEVENT');
      expect(text).toContain('SUMMARY:Mastering Surface Modeling in SolidWorks');
      expect(text).toContain('END:VCALENDAR');
    });
  });
});
