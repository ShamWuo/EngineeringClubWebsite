-- Migration 00009: Team verification status
-- Allows student teams to be created straight up with pending verification,
-- verified by officers later.

alter table teams
  add column if not exists is_verified boolean not null default false;

-- Mark existing seeded teams as verified
update teams set is_verified = true where is_verified = false;

create index if not exists idx_teams_verified on teams (is_verified);
