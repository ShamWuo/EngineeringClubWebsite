import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  redirectTo: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  grad_year: z.coerce.number().int().min(2020).max(2035).nullable().optional(),
  skills: z.array(z.string().trim().min(1)).default([]),
  avatar_url: z.string().url('Invalid avatar URL').nullable().optional().or(z.literal('')),
});

export const competitionSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(150),
  description: z.string().optional().nullable(),
  organizer: z.string().optional().nullable(),
  status: z.enum(['idea', 'planned', 'active', 'completed', 'cancelled']).default('planned'),
  season: z.string().optional().nullable(),
  registration_opens_at: z.string().optional().nullable(),
  registration_closes_at: z.string().optional().nullable(),
  event_starts_at: z.string().optional().nullable(),
  event_ends_at: z.string().optional().nullable(),
  max_teams: z.coerce.number().int().positive().nullable().optional(),
  max_team_size: z.coerce.number().int().positive().nullable().optional(),
  entry_fee_cents: z.coerce.number().int().min(0).default(0),
  external_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
});

export const competitionRequestSchema = z.object({
  name: z.string().min(3, 'Competition name must be at least 3 characters'),
  organizer: z.string().optional().nullable(),
  url: z.string().url('Invalid competition URL').optional().nullable().or(z.literal('')),
  why: z.string().min(10, 'Please provide a clear justification why the club should participate'),
  estimated_cost_cents: z.coerce.number().int().min(0).default(0),
  estimated_team_size: z.coerce.number().int().positive().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export const competitionSignupSchema = z.object({
  competition_id: z.string().uuid('Invalid competition ID'),
  note: z.string().max(500).optional().nullable(),
});

export const teamRequestSchema = z.object({
  competition_id: z.string().uuid('Invalid competition ID'),
  proposed_name: z.string().min(3, 'Team name must be at least 3 characters'),
  purpose: z.string().min(10, 'Please describe your team objectives and focus areas'),
  proposed_member_ids: z.array(z.string().uuid()).default([]),
  needs_funding: z.boolean().default(false),
});

export const teamRosterUpdateSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['lead', 'member']).default('member'),
  action: z.enum(['add', 'remove', 'set_lead']),
});

export const workshopSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().nullable(),
  instructor_id: z.string().uuid().optional().nullable(),
  instructor_name: z.string().optional().nullable(),
  status: z.enum(['proposed', 'scheduled', 'completed', 'cancelled']).default('scheduled'),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  skill_level: z.string().optional().nullable(),
  materials_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  recording_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
});

export const workshopRequestSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters'),
  rationale: z.string().min(10, 'Please explain why this workshop is valuable to members'),
  offering_to_teach: z.boolean().default(false),
  preferred_timeframe: z.string().optional().nullable(),
});

export const workshopRsvpSchema = z.object({
  workshop_id: z.string().uuid(),
  attended: z.boolean().optional(),
});

export const fundingLineItemSchema = z.object({
  description: z.string().min(2, 'Description required'),
  vendor: z.string().optional().nullable(),
  unit_cost_cents: z.coerce.number().int().min(1, 'Cost must be greater than 0'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
});

export const fundingRequestSchema = z.object({
  team_id: z.string().uuid().optional().nullable(),
  competition_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  justification: z.string().min(10, 'Please describe why these funds are necessary and what milestones they enable'),
  line_items: z.array(fundingLineItemSchema).min(1, 'At least one line item is required'),
});

export const fundingReviewSchema = z.object({
  request_id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'changes_requested']),
  approved_amount_cents: z.coerce.number().int().min(0).optional(),
  note: z.string().optional().nullable(),
});

export const workLogSchema = z.object({
  team_id: z.string().uuid().optional().nullable(),
  competition_id: z.string().uuid().optional().nullable(),
  body: z.string().min(5, 'Work log entry must be at least 5 characters'),
  hours_spent: z.coerce.number().min(0.1, 'Hours must be at least 0.1').max(100).nullable().optional(),
  blockers: z.string().optional().nullable(),
  visibility: z.enum(['team', 'club']).default('team'),
});

export const linkSchema = z.object({
  label: z.string().min(2, 'Label required'),
  url: z.string().url('Must be a valid URL'),
  description: z.string().optional().nullable(),
  tier: z.enum(['primary', 'secondary', 'resource']).default('secondary'),
  icon: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const adminMemberRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['member', 'officer', 'admin']),
  is_active: z.boolean().default(true),
});

export const generalRequestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.enum(['equipment', 'tool_access', 'sponsorship', 'mentorship', 'general']).default('general'),
  description: z.string().min(10, 'Please describe your request in detail (what you need, why, timeline)'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export const adminSettingsSchema = z.object({
  club_name: z.string().min(2, 'Club name required'),
  allowed_email_domain: z.string().min(2, 'Domain required (e.g. bvsd.org)'),
  budget_ceiling_cents: z.coerce.number().int().min(0),
});
