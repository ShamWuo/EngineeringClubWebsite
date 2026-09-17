-- Seed Data for Engineering Club Website (No Mock Users)

-- 1. Insert Club Settings
insert into club_settings (id, club_name, allowed_email_domain, budget_ceiling_cents)
values ('default', 'Fairview High School Engineering Club', 'bvsd.org', 5000000)
on conflict (id) do nothing;

-- 2. Competitions
insert into competitions (id, slug, name, description, organizer, status, season, registration_opens_at, registration_closes_at, event_starts_at, event_ends_at, max_teams, max_team_size, entry_fee_cents, external_url, created_by)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'first-robotics-2027', 'FIRST Robotics Competition 2027', 'The premier international high school robotics challenge. Teams design, CNC-machine, wire, and program industrial-grade 125-lb robots in an intensive build cycle to compete in the 2027 field game. Features advanced swerve drive, pneumatic actuators, machine vision tracking, and alliance tournament play.', 'FIRST (For Inspiration & Recognition of Science & Technology)', 'active', '2026-27', now() - interval '30 days', now() + interval '30 days', now() + interval '90 days', now() + interval '94 days', 2, 35, 600000, 'https://www.firstinspires.org/robotics/frc', null),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nasa-rover-challenge', 'NASA Human Exploration Rover Challenge 2027', 'Design, fabricate, and pilot a human-powered collapsible rover capable of traversing a rugged half-mile simulated lunar and Martian obstacle course at the U.S. Space & Rocket Center in Huntsville, AL. Teams complete real-time core sampling and equipment deployment while meeting strict telemetry and safety standards.', 'NASA Marshall Space Flight Center', 'active', '2026-27', now() - interval '20 days', now() + interval '15 days', now() + interval '120 days', now() + interval '124 days', 2, 8, 0, 'https://www.nasa.gov/roverchallenge', null),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'american-rocketry-2027', 'American Rocketry Challenge 2027', 'The world''s largest student aerospace contest. High school teams engineer and launch dual-stage or high-power model rockets carrying two raw Grade A eggs to exactly 800 feet with a flight duration of 37–40 seconds, returning payload and motor stages undamaged via dual-parachute recovery.', 'Aerospace Industries Association & NAR', 'planned', '2026-27', now() + interval '10 days', now() + interval '60 days', now() + interval '180 days', now() + interval '182 days', 3, 10, 15000, 'https://rocketrychallenge.org', null),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'solar-car-challenge', 'National Solar Car Challenge', 'High school engineering teams design, build, and race full-scale roadworthy solar-electric vehicles. Squads engineer custom tubular steel roll cages, MPPT solar charging arrays, active lithium battery management systems (BMS), and composite aerodynamic fairings to race at the Texas Motor Speedway.', 'Solar Car Challenge Foundation', 'completed', '2025-26', now() - interval '300 days', now() - interval '250 days', now() - interval '100 days', now() - interval '96 days', 1, 15, 80000, 'https://www.solarcarchallenge.org', null)
on conflict (id) do nothing;

-- 3. Teams
insert into teams (id, competition_id, name, description, is_recruiting, created_by)
values
  ('10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FHS Knights FRC Drivetrain & Chassis', 'Precision swerve drive kinematics, CNC routed structural aluminum bellypan, and 125-lb competition chassis fabrication.', true, null),
  ('10000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'FHS Knights FRC Intake & Manipulation', 'Active roller intake mechanisms, pneumatic indexing systems, brushless flywheel velocity control, and machine vision targeting.', true, null),
  ('10000003-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'FHS Knights Lunar Rover Alpha', 'Primary rover chassis and drivetrain subteam focused on lightweight chromoly frame geometry, custom suspension linkage, and 3D-printed airless tire compliant treads.', false, null)
on conflict (id) do nothing;

-- 4. Workshops
insert into workshops (id, slug, title, description, instructor_id, instructor_name, status, starts_at, ends_at, location, capacity, skill_level, materials_url, recording_url, created_by)
values
  ('50000001-1111-1111-1111-111111111111', 'solidworks-advanced-surfacing', 'Mastering Surface Modeling in SolidWorks', 'Deep dive into complex boundary surfaces, lofts, tangency curvature continuity (G2), and ergonomic handheld enclosures.', null, 'Staff Instructor', 'scheduled', now() + interval '3 days' + interval '2 hours', now() + interval '3 days' + interval '4 hours', 'FHS Makerspace & Zoom', 30, 'Intermediate', 'https://github.com/fhs-engineering/solidworks-workshop', null, null),
  ('50000002-2222-2222-2222-222222222222', 'kicad-pcb-design-crashcourse', 'From Schematic to 4-Layer PCB in KiCad', 'Learn component footprint selection, differential pair routing, ground planes, impedance matching, and Gerber export.', null, 'Electronics Lead', 'scheduled', now() + interval '7 days' + interval '3 hours', now() + interval '7 days' + interval '5 hours', 'FHS Electronics Lab', 20, 'Beginner to Intermediate', 'https://github.com/fhs-engineering/kicad-templates', null, null),
  ('50000003-3333-3333-3333-333333333333', 'intro-to-lathe-and-cnc-mill', 'Shop Safety: CNC Mill & Manual Lathe Certification', 'Hands-on safety protocol, feeds & speeds, tooling offset zeroing, and emergency stop operational training.', null, 'Shop Supervisor', 'completed', now() - interval '14 days', now() - interval '14 days' + interval '3 hours', 'FHS Machine Shop', 15, 'All Levels', 'https://fhs-engineering.org/safety-docs', 'https://youtube.com/watch?v=mock-cnc-recording', null)
on conflict (id) do nothing;

-- 5. Links
insert into links (id, label, url, description, tier, icon, sort_order, is_active)
values
  ('80000001-1111-1111-1111-111111111111', 'Club Discord Server', 'https://discord.gg/engineering-club', 'Our primary real-time communication hub for all subteams, announcements, and voice channels.', 'primary', 'MessageSquare', 1, true),
  ('80000002-2222-2222-2222-222222222222', 'SolidWorks & Altium Student Licenses', 'https://fhs-engineering.org/software-licenses', 'Access student CAD and EDA license keys provided by the engineering department sponsorship.', 'primary', 'Key', 2, true),
  ('80000003-3333-3333-3333-333333333333', 'Makerspace Safety Waiver & Certifications', 'https://safety.fhs-engineering.org/makerspace-waiver', 'Mandatory safety protocol and certification status tracker required before using heavy machinery.', 'primary', 'ShieldAlert', 3, true),
  ('80000004-4444-4444-4444-444444444444', 'Club GitHub Organization', 'https://github.com/fhs-engineering', 'Shared repositories for firmware, ROS2 packages, telemetry dashboards, and hardware designs.', 'primary', 'Github', 4, true),

  ('80000005-5555-5555-5555-555555555555', '3D Print Queue & Material Requests', 'https://3dprint.fhs-engineering.org/queue', 'Submit STL files for Markforged Onyx and Bambu Lab X1-Carbon printers.', 'secondary', 'Printer', 5, true),
  ('80000006-6666-6666-6666-666666666666', 'DigiKey Club Account Discount Portal', 'https://digikey.com/edu/discount', '15% educational discount for club purchases.', 'secondary', 'ShoppingBag', 6, true),
  ('80000007-7777-7777-7777-777777777777', 'Machine Shop Reservation Calendar', 'https://calendar.google.com/calendar/u/0?cid=shop_calendar', 'Book time on the Tormach CNC mill or manual lathe.', 'secondary', 'Calendar', 7, true),

  ('80000008-8888-8888-8888-888888888888', 'Club Constitution & Bylaws 2026-27', 'https://fhs-engineering.org/constitution.pdf', 'Official operational guidelines and election protocols.', 'resource', 'FileText', 8, true),
  ('80000009-9999-9999-9999-999999999999', 'FHS Engineering Travel & Reimbursement Policy', 'https://finance.fhs-engineering.org/travel-rules', 'Standard reimbursement limits for competition lodging and gas.', 'resource', 'Compass', 9, true)
on conflict (id) do nothing;
