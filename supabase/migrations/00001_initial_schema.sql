-- Migration: 00001_initial_schema.sql
-- Description: Initial schema with enums, tables, constraints, indexes, and views.

-- 1. Enums
create type user_role as enum ('member', 'officer', 'admin');
create type request_status as enum ('pending', 'approved', 'rejected', 'changes_requested', 'withdrawn');
create type comp_status as enum ('idea', 'planned', 'active', 'completed', 'cancelled');
create type workshop_status as enum ('proposed', 'scheduled', 'completed', 'cancelled');
create type team_role as enum ('lead', 'member');
create type funding_status as enum ('pending', 'approved', 'partially_approved', 'rejected', 'reimbursed');
create type link_tier as enum ('primary', 'secondary', 'resource');

-- 2. Profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  grad_year int,
  role user_role not null default 'member',
  skills text[] default '{}',
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Competitions
create table competitions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  organizer text,
  status comp_status not null default 'planned',
  season text,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  event_starts_at timestamptz,
  event_ends_at timestamptz,
  max_teams int,
  max_team_size int,
  entry_fee_cents int default 0,
  external_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  name text not null,
  description text,
  is_recruiting boolean default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_competition_team_name unique (competition_id, name)
);

-- 5. Team Members
create table team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role team_role not null default 'member',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Partial unique index to enforce exactly one lead per team
create unique index one_lead_per_team on team_members (team_id) where role = 'lead';

-- 6. Competition Signups
create table competition_signups (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  note text,
  status request_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint uq_competition_user_signup unique (competition_id, user_id)
);

-- 7. Team Requests (The team request form)
create table team_requests (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  requested_by uuid not null references profiles(id) on delete cascade,
  proposed_name text not null,
  purpose text,
  proposed_member_ids uuid[] default '{}',
  needs_funding boolean default false,
  status request_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_team_id uuid references teams(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Competition Requests
create table competition_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id) on delete cascade,
  name text not null,
  organizer text,
  url text,
  why text,
  estimated_cost_cents int default 0,
  estimated_team_size int,
  deadline date,
  status request_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_competition_id uuid references competitions(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Workshops
create table workshops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  instructor_id uuid references profiles(id) on delete set null,
  instructor_name text,
  status workshop_status not null default 'scheduled',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  capacity int,
  skill_level text,
  materials_url text,
  recording_url text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. Workshop RSVPs
create table workshop_rsvps (
  workshop_id uuid not null references workshops(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  attended boolean default false,
  created_at timestamptz default now(),
  primary key (workshop_id, user_id)
);

-- 11. Workshop Requests
create table workshop_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id) on delete cascade,
  topic text not null,
  rationale text,
  offering_to_teach boolean default false,
  preferred_timeframe text,
  status request_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_workshop_id uuid references workshops(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12. Workshop Request Votes
create table workshop_request_votes (
  request_id uuid not null references workshop_requests(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (request_id, user_id)
);

-- 13. Funding Requests
create table funding_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  competition_id uuid references competitions(id) on delete set null,
  title text not null,
  justification text,
  amount_requested_cents int not null check (amount_requested_cents > 0),
  amount_approved_cents int check (amount_approved_cents is null or amount_approved_cents >= 0),
  status funding_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  reimbursed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. Funding Line Items
create table funding_line_items (
  id uuid primary key default gen_random_uuid(),
  funding_request_id uuid not null references funding_requests(id) on delete cascade,
  description text not null,
  vendor text,
  unit_cost_cents int not null check (unit_cost_cents >= 0),
  quantity int not null default 1 check (quantity > 0),
  url text,
  created_at timestamptz default now()
);

-- 15. Funding Attachments / Receipts
create table funding_attachments (
  id uuid primary key default gen_random_uuid(),
  funding_request_id uuid not null references funding_requests(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 16. Work Logs
create table work_logs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  competition_id uuid references competitions(id) on delete set null,
  body text not null,
  hours_spent numeric(4,1),
  blockers text,
  visibility text not null default 'team' check (visibility in ('team', 'club')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 17. Links
create table links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  description text,
  tier link_tier not null default 'secondary',
  icon text,
  sort_order int default 0,
  is_active boolean default true,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz default now()
);

-- 18. Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- 19. Audit Log
create table audit_log (
  id bigserial primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  diff jsonb,
  created_at timestamptz default now()
);

-- 20. Club Settings
create table club_settings (
  id text primary key default 'default',
  club_name text not null default 'University Engineering Club',
  allowed_email_domain text not null default 'university.edu',
  budget_ceiling_cents int not null default 5000000,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id) on delete set null
);

-- 21. Indexes
create index idx_competitions_status_event on competitions(status, event_starts_at);
create index idx_teams_competition_id on teams(competition_id);
create index idx_team_members_user_id on team_members(user_id);
create index idx_workshops_status_starts on workshops(status, starts_at);
create index idx_work_logs_team_created on work_logs(team_id, created_at desc);
create index idx_work_logs_author_created on work_logs(author_id, created_at desc);
create index idx_team_requests_pending on team_requests(status) where status = 'pending';
create index idx_comp_requests_pending on competition_requests(status) where status = 'pending';
create index idx_workshop_requests_pending on workshop_requests(status) where status = 'pending';
create index idx_funding_requests_pending on funding_requests(status) where status = 'pending';
create index idx_links_tier_sort on links(tier, sort_order);

-- 22. Unified Review Queue View
create or replace view pending_requests
with (security_invoker = true) as
  select
    'team'::text as kind,
    id,
    requested_by,
    created_at,
    status::text as status,
    proposed_name as title,
    purpose as summary
  from team_requests
  union all
  select
    'competition'::text as kind,
    id,
    requested_by,
    created_at,
    status::text as status,
    name as title,
    why as summary
  from competition_requests
  union all
  select
    'workshop'::text as kind,
    id,
    requested_by,
    created_at,
    status::text as status,
    topic as title,
    rationale as summary
  from workshop_requests
  union all
  select
    'funding'::text as kind,
    id,
    requested_by,
    created_at,
    status::text as status,
    title as title,
    justification as summary
  from funding_requests;
