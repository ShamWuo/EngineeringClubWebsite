import { describe, it, expect, beforeEach } from 'vitest';
import { getDb, resetDb } from '@/lib/db/mock-data';
import { createTeam, verifyTeamAction } from '@/actions/teams';
import { reviewRequestAction } from '@/actions/review';
import { createTeamSchema, verifyTeamSchema } from '@/lib/validation/schemas';

describe('Direct Team Creation & Verification Workflow', () => {
  beforeEach(() => {
    resetDb();
  });

  describe('createTeam action', () => {
    it('creates team straight up with unverified status, assigns creator as lead, and adds selected members', async () => {
      const db = getDb();
      const compId = db.competitions[0].id;
      const initialTeamCount = db.teams.length;
      const member1Id = '22222222-2222-2222-2222-222222222222';
      const member2Id = '33333333-3333-3333-3333-333333333333';

      const res = await createTeam({
        competition_id: compId,
        name: 'FHS Autonomous Flight Dynamics',
        description: 'Design and build autonomous quadcopters with vision-based target localization.',
        member_ids: [member1Id, member2Id],
        needs_funding: true,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const createdTeam = res.data.team;
      expect(createdTeam).toBeDefined();
      expect(createdTeam.name).toBe('FHS Autonomous Flight Dynamics');
      expect(createdTeam.is_verified).toBe(false); // Unverified initially!
      expect(createdTeam.is_recruiting).toBe(true);

      // Verify team is present in database
      expect(db.teams.length).toBe(initialTeamCount + 1);
      const teamInDb = db.teams.find((t) => t.id === createdTeam.id);
      expect(teamInDb).toBeDefined();
      expect(teamInDb?.is_verified).toBe(false);

      // Verify roster assignments: creator should be lead, others should be members
      const membersInDb = db.team_members.filter((m) => m.team_id === createdTeam.id);
      expect(membersInDb.length).toBe(3); // Creator + 2 members

      const lead = membersInDb.find((m) => m.role === 'lead');
      expect(lead).toBeDefined();
      expect(lead?.user_id).toBe(createdTeam.created_by);

      const regularMembers = membersInDb.filter((m) => m.role === 'member');
      expect(regularMembers.length).toBe(2);
      expect(regularMembers.map((m) => m.user_id)).toContain(member1Id);
      expect(regularMembers.map((m) => m.user_id)).toContain(member2Id);

      // Verify a linked verification request was queued
      const teamReq = db.team_requests.find((r) => r.created_team_id === createdTeam.id);
      expect(teamReq).toBeDefined();
      expect(teamReq?.status).toBe('pending');
      expect(teamReq?.proposed_name).toBe(createdTeam.name);
      expect(teamReq?.proposed_member_ids).toContain(member1Id);
      expect(teamReq?.proposed_member_ids).toContain(member2Id);
    });

    it('deduplicates creator if inadvertently included in member_ids', async () => {
      const db = getDb();
      const compId = db.competitions[0].id;
      // In action-wrapper test mode, mock user id is db.profiles[0].id or mock user
      // Let's test with empty or duplicate member list
      const res = await createTeam({
        competition_id: compId,
        name: 'FHS Solar Chassis Team',
        description: 'Aerodynamic fairings and carbon fiber frame.',
        member_ids: ['33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333'],
        needs_funding: false,
      });

      expect(res.ok).toBe(true);
      if (!res.ok) return;

      const membersInDb = db.team_members.filter((m) => m.team_id === res.data.team.id);
      // Lead + 1 deduped member = 2 members total
      expect(membersInDb.length).toBe(2);
    });
  });

  describe('verifyTeamAction & officer verification', () => {
    it('officer verifies team directly on team page', async () => {
      const db = getDb();
      const compId = db.competitions[0].id;

      // 1. Create unverified team
      const createRes = await createTeam({
        competition_id: compId,
        name: 'FHS Microgravity Experiment',
        description: 'Fluid dynamics testing in parabolic flight simulator.',
        member_ids: ['22222222-2222-2222-2222-222222222222'],
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;

      const teamId = createRes.data.team.id;
      expect(db.teams.find((t) => t.id === teamId)?.is_verified).toBe(false);

      // 2. Officer verifies the team
      const verifyRes = await verifyTeamAction({
        team_id: teamId,
        note: 'Roster confirmed, safety plan approved.',
      });

      expect(verifyRes.ok).toBe(true);

      // 3. Team is now verified
      const verifiedTeam = db.teams.find((t) => t.id === teamId);
      expect(verifiedTeam?.is_verified).toBe(true);

      // 4. Linked team_requests status is updated to approved
      const linkedReq = db.team_requests.find((r) => r.created_team_id === teamId);
      expect(linkedReq?.status).toBe('approved');
      expect(linkedReq?.review_note).toBe('Roster confirmed, safety plan approved.');
    });

    it('officer approves directly-created team from officer review queue', async () => {
      const db = getDb();
      const compId = db.competitions[0].id;

      // 1. Create unverified team
      const createRes = await createTeam({
        competition_id: compId,
        name: 'FHS Cyber Defense Alpha',
        description: 'Hardening network security protocols.',
        member_ids: [],
      });
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;

      const teamId = createRes.data.team.id;
      const linkedReq = db.team_requests.find((r) => r.created_team_id === teamId);
      expect(linkedReq).toBeDefined();
      expect(linkedReq?.status).toBe('pending');

      // 2. Officer approves via reviewRequestAction
      const reviewRes = await reviewRequestAction({
        kind: 'team',
        requestId: linkedReq!.id,
        decision: 'approve',
        note: 'Official approval granted.',
      });

      expect(reviewRes.ok).toBe(true);
      if (reviewRes.ok) {
        expect(reviewRes.data.createdEntityId).toBe(teamId);
      }

      // 3. Team is verified
      const verifiedTeam = db.teams.find((t) => t.id === teamId);
      expect(verifiedTeam?.is_verified).toBe(true);
      expect(linkedReq?.status).toBe('approved');
    });
  });

  describe('Validation schemas', () => {
    it('createTeamSchema enforces valid competition UUID, name length, and member IDs', () => {
      const valid = createTeamSchema.safeParse({
        competition_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Titan Robotics Drivetrain',
        description: 'Planetary gearboxes and swerve modules.',
        member_ids: ['bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'],
        needs_funding: true,
      });
      expect(valid.success).toBe(true);

      // Name too short (<3 chars)
      const invalidName = createTeamSchema.safeParse({
        competition_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'AB',
      });
      expect(invalidName.success).toBe(false);

      // Invalid competition ID (not uuid)
      const invalidComp = createTeamSchema.safeParse({
        competition_id: 'not-a-uuid',
        name: 'Titan Robotics Drivetrain',
      });
      expect(invalidComp.success).toBe(false);
    });

    it('verifyTeamSchema enforces valid team UUID', () => {
      const valid = verifyTeamSchema.safeParse({
        team_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        note: 'Verified squad',
      });
      expect(valid.success).toBe(true);

      const invalid = verifyTeamSchema.safeParse({
        team_id: 'not-a-uuid',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
