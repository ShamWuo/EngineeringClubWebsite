import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '@/lib/db/mock-data';
import { completeOnboarding } from '@/actions/auth';
import { signupForCompetition, cancelCompetitionSignup } from '@/actions/competitions';
import { getCompetitionDisciplines, ENGINEERING_DISCIPLINES } from '@/lib/constants/competitions';
import { getUserCompetitionSignups, getCompetitions } from '@/lib/db/queries';

describe('Onboarding & Competition Interest Integration', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('Legacy Skill Sanitization', () => {
    it('filters out non-existent legacy disciplines such as CAD & 3D Modeling and 3D Printing & Additive', () => {
      const legacySkills = [
        'CAD 3D Modeling',
        'CAD & 3D Modeling',
        '3D Printed and Additive',
        '3D Printing & Additive',
        'CAD',
        'Embedded Systems',
      ];

      const validDisciplines = new Set(ENGINEERING_DISCIPLINES as readonly string[]);
      const legacySet = new Set(legacySkills);

      const userProfileSkills = [
        'CAD & 3D Modeling',
        '3D Printing & Additive',
        'Aerospace Engineering',
        'Robotics & Mechatronics',
      ];

      const sanitized = userProfileSkills.filter(
        (s) => !legacySet.has(s) && validDisciplines.has(s)
      );

      expect(sanitized).toEqual(['Aerospace Engineering', 'Robotics & Mechatronics']);
      expect(sanitized).not.toContain('CAD & 3D Modeling');
      expect(sanitized).not.toContain('3D Printing & Additive');
    });

    it('defaults to an empty array if profile only had legacy skills', () => {
      const legacySkills = ['CAD & 3D Modeling', '3D Printing & Additive'];
      const validDisciplines = new Set(ENGINEERING_DISCIPLINES as readonly string[]);
      const legacySet = new Set(legacySkills);

      const sanitized = legacySkills.filter(
        (s) => !legacySet.has(s) && validDisciplines.has(s)
      );

      expect(sanitized).toEqual([]);
    });
  });

  describe('Discipline-Based Competition Recommendations', () => {
    it('recommends competitions matching selected disciplines', async () => {
      const allCompetitions = await getCompetitions();
      expect(allCompetitions.length).toBeGreaterThan(0);

      // User chose Aerospace Engineering
      const userDisciplines = ['Aerospace Engineering'];
      const recommended = allCompetitions.filter((c) => {
        const disciplines = getCompetitionDisciplines(c);
        return disciplines.some((d) => userDisciplines.includes(d));
      });

      expect(recommended.length).toBeGreaterThan(0);
      // Rocktery and NASA Rover should be in recommended
      const names = recommended.map((c) => c.name);
      expect(names.some((n) => n.includes('Rocketry') || n.includes('NASA'))).toBe(true);

      // CyberPatriot should NOT be recommended for pure Aerospace
      const cyber = recommended.find((c) => c.slug === 'cyberpatriot-xviii-2026-27');
      expect(cyber).toBeUndefined();
    });

    it('recommends software and cybersecurity competitions for Computer & Software Engineering', async () => {
      const allCompetitions = await getCompetitions();
      const userDisciplines = ['Computer Engineering', 'Software Engineering'];

      const recommended = allCompetitions.filter((c) => {
        const disciplines = getCompetitionDisciplines(c);
        return disciplines.some((d) => userDisciplines.includes(d));
      });

      const slugs = recommended.map((c) => c.slug);
      expect(slugs).toContain('cyberpatriot-xviii-2026-27');
      expect(slugs).toContain('first-robotics-2027');
    });
  });

  describe('Expressing Interest in Competitions during Onboarding', () => {
    it('completes onboarding and records competition signups atomically', async () => {
      const db = getDb();
      const targetComp1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // FRC
      const targetComp2 = 'cccccccc-cccc-cccc-cccc-cccccccccccc'; // Rocketry

      const initialSignupCount = db.competition_signups.length;

      const res = await completeOnboarding({
        full_name: 'Test Onboarding Knight',
        grad_year: 2027,
        skills: ['Aerospace Engineering', 'Mechanical Engineering'],
        interested_competition_ids: [targetComp1, targetComp2],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.data.onboardingCompleted).toBe(true);
      }

      // Check signups in mock database
      const userSignups = await getUserCompetitionSignups('11111111-1111-1111-1111-111111111111');
      const signedCompIds = userSignups.map((s) => s.competition_id);
      expect(signedCompIds).toContain(targetComp1);
      expect(signedCompIds).toContain(targetComp2);

      // Check welcome notification body mentions the competitions
      const welcomeNotif = db.notifications[0];
      expect(welcomeNotif.title).toContain('Welcome to Fairview');
      expect(welcomeNotif.body).toContain('2 upcoming competitions');
    });

    it('supports toggle interest with signupForCompetition and cancelCompetitionSignup', async () => {
      const compId = 'dddddddd-dddd-dddd-dddd-dddddddddddd'; // Solar Car

      // 1. Sign up / Express interest
      const signRes = await signupForCompetition({
        competition_id: compId,
        note: 'Expressed interest during onboarding',
      });
      expect(signRes.ok).toBe(true);

      const signupsAfter = await getUserCompetitionSignups('11111111-1111-1111-1111-111111111111');
      expect(signupsAfter.some((s) => s.competition_id === compId)).toBe(true);

      // 2. Cancel / withdraw interest
      const cancelRes = await cancelCompetitionSignup({
        competition_id: compId,
      });
      expect(cancelRes.ok).toBe(true);

      const signupsFinal = await getUserCompetitionSignups('11111111-1111-1111-1111-111111111111');
      expect(signupsFinal.some((s) => s.competition_id === compId)).toBe(false);
    });
  });
});
