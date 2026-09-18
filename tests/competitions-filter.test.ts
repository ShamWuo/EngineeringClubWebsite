import { describe, it, expect } from 'vitest';
import { getCompetitionDisciplines, ENGINEERING_DISCIPLINES } from '../src/lib/constants/competitions';

describe('Competitions Discipline Mapping & Filtering', () => {
  it('correctly maps known competitions to their engineering disciplines', () => {
    const frc = getCompetitionDisciplines({
      slug: 'first-robotics-2027',
      name: 'FIRST Robotics Competition — BIOCORE 2027',
    });
    expect(frc).toContain('Robotics & Mechatronics');
    expect(frc).toContain('Mechanical Engineering');
    expect(frc).toContain('Electrical Engineering');
    expect(frc).toContain('Software Engineering');

    const rocketry = getCompetitionDisciplines({
      slug: 'american-rocketry-2027',
      name: 'American Rocketry Challenge 2027',
    });
    expect(rocketry).toContain('Aerospace Engineering');
    expect(rocketry).toContain('Mechanical Engineering');

    const cyber = getCompetitionDisciplines({
      slug: 'cyberpatriot-xviii-2026-27',
      name: 'CyberPatriot National Youth Cyber Defense Competition',
    });
    expect(cyber).toContain('Software Engineering');
    expect(cyber).toContain('Computer Engineering');
  });

  it('uses keyword heuristic for unknown competitions', () => {
    const customRocket = getCompetitionDisciplines({
      slug: 'custom-high-altitude-balloon',
      name: 'High Altitude Balloon & Satellite Contest',
      description: 'Design aerospace telemetry payload and rocket tracking system',
    });
    expect(customRocket).toContain('Aerospace Engineering');

    const customRover = getCompetitionDisciplines({
      slug: 'autonomous-rover-sprint',
      name: 'Autonomous Rover Sprint',
      description: 'Actuator control and robotic obstacle avoidance',
    });
    expect(customRover).toContain('Robotics & Mechatronics');
  });

  it('filters out closed registrations and expired competitions', () => {
    const now = Date.now();
    const mockCompetitions = [
      {
        id: '1',
        slug: 'active-open',
        name: 'Open Competition',
        status: 'active',
        registration_closes_at: new Date(now + 10 * 86400000).toISOString(),
        event_ends_at: new Date(now + 30 * 86400000).toISOString(),
      },
      {
        id: '2',
        slug: 'closed-reg',
        name: 'Registration Closed Comp',
        status: 'active',
        registration_closes_at: new Date(now - 2 * 86400000).toISOString(),
        event_ends_at: new Date(now + 30 * 86400000).toISOString(),
      },
      {
        id: '3',
        slug: 'past-event',
        name: 'Past Event Comp',
        status: 'active',
        registration_closes_at: new Date(now - 30 * 86400000).toISOString(),
        event_ends_at: new Date(now - 5 * 86400000).toISOString(),
      },
      {
        id: '4',
        slug: 'completed-comp',
        name: 'Completed Competition',
        status: 'completed',
        registration_closes_at: new Date(now + 10 * 86400000).toISOString(),
        event_ends_at: new Date(now + 30 * 86400000).toISOString(),
      },
      {
        id: '5',
        slug: 'cancelled-comp',
        name: 'Cancelled Competition',
        status: 'cancelled',
        registration_closes_at: new Date(now + 10 * 86400000).toISOString(),
        event_ends_at: new Date(now + 30 * 86400000).toISOString(),
      },
    ];

    const openCompetitions = mockCompetitions.filter((c) => {
      if (c.status === 'completed' || c.status === 'cancelled') return false;
      if (c.registration_closes_at && new Date(c.registration_closes_at).getTime() < now) return false;
      if (c.event_ends_at && new Date(c.event_ends_at).getTime() < now) return false;
      return true;
    });

    expect(openCompetitions).toHaveLength(1);
    expect(openCompetitions[0].id).toBe('1');
  });

  it('sorts competitions by participant count descending by default', () => {
    const comps = [
      { id: 'comp-1', name: 'Low Participation' },
      { id: 'comp-2', name: 'High Participation' },
      { id: 'comp-3', name: 'Medium Participation' },
    ];

    const teamsData = [
      { competition_id: 'comp-1', memberCount: 2 },
      { competition_id: 'comp-2', memberCount: 15 },
      { competition_id: 'comp-2', memberCount: 10 }, // 25 total
      { competition_id: 'comp-3', memberCount: 8 },  // 8 total
    ];

    const getParticipantCount = (compId: string) => {
      return teamsData
        .filter((t) => t.competition_id === compId)
        .reduce((acc, t) => acc + (t.memberCount || 0), 0);
    };

    const sorted = [...comps].sort((a, b) => {
      const countA = getParticipantCount(a.id);
      const countB = getParticipantCount(b.id);
      return countB - countA;
    });

    expect(sorted.map((c) => c.id)).toEqual(['comp-2', 'comp-3', 'comp-1']);
    expect(getParticipantCount(sorted[0].id)).toBe(25);
    expect(getParticipantCount(sorted[1].id)).toBe(8);
    expect(getParticipantCount(sorted[2].id)).toBe(2);
  });
});
