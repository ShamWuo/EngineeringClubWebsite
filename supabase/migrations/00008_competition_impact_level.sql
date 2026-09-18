-- Migration 00008: Competition impact level taxonomy
-- Classifies every competition by the highest level it reaches so the member
-- directory can be filtered by impact: world > national > regional > local.

alter table competitions
  add column if not exists impact_level text
  not null default 'national'
  check (impact_level in ('world', 'national', 'regional', 'local'));

-- Backfill the seeded catalog by slug (everything else keeps 'national').
update competitions set impact_level = 'world'
  where slug in (
    'first-robotics-2027',
    'ftc-biobuzz-2026-27',
    'vex-override-2026-27',
    'zero-robotics-2026-27',
    'seaperch-international-2027',
    'nasa-rover-challenge'
  );

update competitions set impact_level = 'regional'
  where slug in (
    'co-science-bowl-2027'
  );

update competitions set impact_level = 'local'
  where slug in (
    'fhs-maker-sprint-fall-2026'
  );

create index if not exists idx_competitions_impact on competitions (impact_level, status);
