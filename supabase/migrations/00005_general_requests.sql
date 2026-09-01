-- Migration: 00005_general_requests.sql
-- Description: Table for general club proposals/requests (equipment, sponsorships, mentorship, ideas).

create table if not exists general_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references profiles(id) on delete cascade,
  title text not null,
  category text not null default 'general', -- 'equipment', 'sponsorship', 'tool_access', 'mentorship', 'general'
  description text not null,
  urgency text not null default 'medium', -- 'low', 'medium', 'high', 'critical'
  status request_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS on general_requests
alter table general_requests enable row level security;

create policy "general_requests_select" on general_requests for select to authenticated using (
  requested_by = auth.uid() or is_officer()
);

create policy "general_requests_insert_self" on general_requests for insert to authenticated with check (
  requested_by = auth.uid()
);

create policy "general_requests_update" on general_requests for update to authenticated using (
  (requested_by = auth.uid() and status = 'pending') or is_officer()
);

-- Status trigger guard
create trigger trg_general_req_status_guard
  before update on general_requests
  for each row execute function public.prevent_unauthorized_status_change();

-- Update pending_requests view
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
  from funding_requests
  union all
  select
    'general'::text as kind,
    id,
    requested_by,
    created_at,
    status::text as status,
    title as title,
    description as summary
  from general_requests;
