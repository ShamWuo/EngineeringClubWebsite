import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  profileUpdateSchema,
  competitionSchema,
  competitionRequestSchema,
  teamRequestSchema,
  workshopSchema,
  workshopRequestSchema,
  fundingRequestSchema,
  fundingLineItemSchema,
  workLogSchema,
  linkSchema,
  adminSettingsSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email addresses', () => {
      const res = loginSchema.safeParse({ email: 'alex.vance@university.edu' });
      expect(res.success).toBe(true);
    });

    it('rejects malformed email addresses', () => {
      const res = loginSchema.safeParse({ email: 'not-an-email' });
      expect(res.success).toBe(false);
    });
  });

  describe('competitionSchema', () => {
    it('accepts valid competition payload with hyphenated slug', () => {
      const res = competitionSchema.safeParse({
        slug: 'formula-sae-2027',
        name: 'Formula SAE Electric 2027',
        status: 'active',
        entry_fee_cents: 250000,
        max_teams: 2,
        max_team_size: 25,
      });
      expect(res.success).toBe(true);
    });

    it('rejects invalid slug with uppercase letters or spaces', () => {
      const res = competitionSchema.safeParse({
        slug: 'Formula SAE 2027',
        name: 'Formula SAE Electric 2027',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('teamRequestSchema', () => {
    it('validates a team request with proposed member UUIDs', () => {
      const res = teamRequestSchema.safeParse({
        competition_id: '11111111-1111-1111-1111-111111111111',
        proposed_name: 'Apex Powertrain',
        purpose: 'Designing the 400V inverter and high-voltage contactor box.',
        proposed_member_ids: ['22222222-2222-2222-2222-222222222222'],
        needs_funding: true,
      });
      expect(res.success).toBe(true);
    });

    it('rejects team requests with short purpose descriptions', () => {
      const res = teamRequestSchema.safeParse({
        competition_id: '11111111-1111-1111-1111-111111111111',
        proposed_name: 'Apex',
        purpose: 'short',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('fundingRequestSchema & fundingLineItemSchema', () => {
    it('validates multi-line item funding requests', () => {
      const res = fundingRequestSchema.safeParse({
        title: 'BMS Electronics & Contactors',
        justification: 'Required for tech inspection compliance EV4.1.',
        line_items: [
          {
            description: 'Gigavac Contactor',
            vendor: 'Mouser',
            unit_cost_cents: 18500,
            quantity: 2,
            url: 'https://mouser.com/item',
          },
          {
            description: 'TI BMS Chips',
            vendor: 'DigiKey',
            unit_cost_cents: 1200,
            quantity: 10,
          },
        ],
      });
      expect(res.success).toBe(true);
    });

    it('rejects line items with 0 or negative unit cost', () => {
      const res = fundingLineItemSchema.safeParse({
        description: 'Free item',
        unit_cost_cents: 0,
        quantity: 1,
      });
      expect(res.success).toBe(false);
    });

    it('rejects funding requests with empty line items array', () => {
      const res = fundingRequestSchema.safeParse({
        title: 'Empty Request',
        justification: 'Should fail validation',
        line_items: [],
      });
      expect(res.success).toBe(false);
    });
  });

  describe('linkSchema', () => {
    it('accepts link with valid tiers', () => {
      const res = linkSchema.safeParse({
        label: 'Club Discord',
        url: 'https://discord.gg/test',
        tier: 'primary',
        sort_order: 1,
      });
      expect(res.success).toBe(true);
    });

    it('rejects link with invalid URL', () => {
      const res = linkSchema.safeParse({
        label: 'Bad Link',
        url: 'not-a-url',
        tier: 'secondary',
      });
      expect(res.success).toBe(false);
    });
  });
});
