-- Seed Data for Engineering Club Website

-- 1. Insert Club Settings
insert into club_settings (id, club_name, allowed_email_domain, budget_ceiling_cents)
values ('default', 'Apex University Engineering Club', 'university.edu', 5000000)
on conflict (id) do nothing;

-- 2. Mock Users (Profiles)
insert into profiles (id, email, full_name, grad_year, role, skills, avatar_url, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'alex.vance@university.edu', 'Alex Vance', 2026, 'admin', array['Robotics', 'CAD', 'Embedded Systems', 'PCB Design'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
  ('22222222-2222-2222-2222-222222222222', 'maya.lin@university.edu', 'Maya Lin', 2026, 'officer', array['Project Management', 'Structural Analysis', 'FEA', 'Welding'], 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', true),
  ('33333333-3333-3333-3333-333333333333', 'sam.rivera@university.edu', 'Sam Rivera', 2027, 'member', array['Autonomous Navigation', 'ROS2', 'Computer Vision', 'Python'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
  ('44444444-4444-4444-4444-444444444444', 'jordan.chen@university.edu', 'Jordan Chen', 2028, 'member', array['Full-Stack Web', 'C++', 'Microcontrollers', 'Git'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true),
  ('55555555-5555-5555-5555-555555555555', 'taylor.swift@university.edu', 'Taylor Kim', 2027, 'member', array['Aerodynamics', 'CFD', 'Composites', '3D Printing'], 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', true)
on conflict (id) do nothing;

-- 3. Competitions
insert into competitions (id, slug, name, description, organizer, status, season, registration_opens_at, registration_closes_at, event_starts_at, event_ends_at, max_teams, max_team_size, entry_fee_cents, external_url, created_by)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'formula-sae-2027', 'Formula SAE Electric 2027', 'Design, build, and race a formula-style electric racecar. Teams are evaluated on engineering design, cost analysis, sales presentation, dynamic acceleration, skidpad, autocross, and endurance.', 'SAE International', 'active', '2026-27', now() - interval '30 days', now() + interval '30 days', now() + interval '90 days', now() + interval '94 days', 2, 25, 250000, 'https://www.fsaeonline.com', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'nasa-rover-challenge', 'NASA Human Exploration Rover Challenge', 'Design, build, and test human-powered rovers capable of traversing simulated lunar and Martian terrain while completing scientific mission tasks.', 'NASA Marshall Space Flight Center', 'active', '2026-27', now() - interval '20 days', now() + interval '15 days', now() + interval '120 days', now() + interval '123 days', 3, 10, 150000, 'https://www.nasa.gov/roverchallenge', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'robomaster-university-league', 'RoboMaster University League 2027', 'Advanced robotic combat competition combining engineering, computer vision, automatic aiming, and tactical gameplay.', 'DJI / RoboMaster', 'planned', '2026-27', now() + interval '10 days', now() + interval '60 days', now() + interval '180 days', now() + interval '185 days', 1, 20, 300000, 'https://www.robomaster.com', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'university-cubesat-challenge', 'AIAA CanSat & SmallSat Initiative', 'Design and launch an atmospheric probe with sensor telemetry and autonomous descent control.', 'AIAA', 'completed', '2025-26', now() - interval '300 days', now() - interval '250 days', now() - interval '100 days', now() - interval '98 days', 2, 8, 100000, 'https://www.cansatcompetition.com', '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

-- 4. Teams
insert into teams (id, competition_id, name, description, is_recruiting, created_by)
values
  ('10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apex E-Racing Powertrain', 'Developing the 400V battery pack, inverter cooling loops, and high-torque electric motor mounts.', true, '33333333-3333-3333-3333-333333333333'),
  ('10000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apex E-Racing Aero & Chassis', 'Carbon fiber monocoque design, front and rear wing aerodynamics, and composite layup manufacturing.', true, '55555555-5555-5555-5555-555555555555'),
  ('10000003-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ares Lunar Rover Alpha', 'Primary rover chassis and drivetrain team focused on lightweight titanium suspension and airless wheel tread.', false, '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;

-- 5. Team Members
insert into team_members (team_id, user_id, role, joined_at)
values
  ('10000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'lead', now() - interval '25 days'),
  ('10000001-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'member', now() - interval '20 days'),
  ('10000002-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'lead', now() - interval '22 days'),
  ('10000002-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'member', now() - interval '18 days'),
  ('10000003-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'lead', now() - interval '15 days'),
  ('10000003-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'member', now() - interval '12 days')
on conflict (team_id, user_id) do nothing;

-- 6. Competition Signups
insert into competition_signups (id, competition_id, user_id, note, status)
values
  ('20000001-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Interested in the CV targeting subsystem using OpenCV and PyTorch.', 'pending'),
  ('20000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Assigned to Powertrain lead.', 'approved')
on conflict (id) do nothing;

-- 7. Team Requests (Pending review)
insert into team_requests (id, competition_id, requested_by, proposed_name, purpose, proposed_member_ids, needs_funding, status)
values
  ('30000001-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'Apex Sentry Robotics', 'Autonomous ground defense robot team with LIDAR mapping, armor plate impact sensing, and 3-axis turret gimbal.', array['44444444-4444-4444-4444-444444444444'::uuid, '33333333-3333-3333-3333-333333333333'::uuid], true, 'pending')
on conflict (id) do nothing;

-- 8. Competition Requests (Pending review)
insert into competition_requests (id, requested_by, name, organizer, url, why, estimated_cost_cents, estimated_team_size, deadline, status)
values
  ('40000001-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Micro Air Vehicle (MAV) Autonomous Challenge', 'International Micro Air Vehicle Conference', 'https://www.imavs.org', 'Great hands-on test for aerodynamic drone design and GPS-denied tunnel exploration.', 250000, 6, '2026-11-15', 'pending')
on conflict (id) do nothing;

-- 9. Workshops
insert into workshops (id, slug, title, description, instructor_id, instructor_name, status, starts_at, ends_at, location, capacity, skill_level, materials_url, recording_url, created_by)
values
  ('50000001-1111-1111-1111-111111111111', 'solidworks-advanced-surfacing', 'Mastering Surface Modeling in SolidWorks', 'Deep dive into complex boundary surfaces, lofts, tangency curvature continuity (G2), and ergonomic handheld enclosures.', '11111111-1111-1111-1111-111111111111', 'Alex Vance', 'scheduled', now() + interval '3 days' + interval '2 hours', now() + interval '3 days' + interval '4 hours', 'Makerspace Lab 204 & Zoom', 30, 'Intermediate', 'https://github.com/apex-eng-club/solidworks-workshop', null, '11111111-1111-1111-1111-111111111111'),
  ('50000002-2222-2222-2222-222222222222', 'kicad-pcb-design-crashcourse', 'From Schematic to 4-Layer PCB in KiCad', 'Learn component footprint selection, differential pair routing, ground planes, impedance matching, and Gerber export.', '33333333-3333-3333-3333-333333333333', 'Sam Rivera', 'scheduled', now() + interval '7 days' + interval '3 hours', now() + interval '7 days' + interval '5 hours', 'Electronics Bay 102', 20, 'Beginner to Intermediate', 'https://github.com/apex-eng-club/kicad-templates', null, '22222222-2222-2222-2222-222222222222'),
  ('50000003-3333-3333-3333-333333333333', 'intro-to-lathe-and-cnc-mill', 'Shop Safety: CNC Mill & Manual Lathe Certification', 'Hands-on safety protocol, feeds & speeds, tooling offset zeroing, and emergency stop operational training.', '22222222-2222-2222-2222-222222222222', 'Maya Lin', 'completed', now() - interval '14 days', now() - interval '14 days' + interval '3 hours', 'Machine Shop Annex', 15, 'All Levels', 'https://apex-eng-club.org/safety-docs', 'https://youtube.com/watch?v=mock-cnc-recording', '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

-- 10. Workshop RSVPs
insert into workshop_rsvps (workshop_id, user_id, attended)
values
  ('50000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', false),
  ('50000001-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', false),
  ('50000002-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', false),
  ('50000003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', true),
  ('50000003-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', true)
on conflict (workshop_id, user_id) do nothing;

-- 11. Workshop Requests
insert into workshop_requests (id, requested_by, topic, rationale, offering_to_teach, preferred_timeframe, status)
values
  ('60000001-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Embedded Rust on ESP32 & STM32', 'Memory safety in real-time firmware without GC overhead. Many members want to modernize their C codebases.', true, 'Next month on Thursday evening', 'pending')
on conflict (id) do nothing;

insert into workshop_request_votes (request_id, user_id)
values
  ('60000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
  ('60000001-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555')
on conflict (request_id, user_id) do nothing;

-- 12. Funding Requests
insert into funding_requests (id, requested_by, team_id, competition_id, title, justification, amount_requested_cents, amount_approved_cents, status)
values
  ('70000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BMS Battery Management System ICs & High-Voltage Contactors', 'Critical safety interlocks required for tech inspection rules EV4.1 and EV4.2 at Formula SAE.', 48500, null, 'pending'),
  ('70000002-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Twill Weave Carbon Fiber Fabric & Epoxy Resin Infusion Kit', 'Composite materials for front wing endplate mold manufacturing.', 75000, 75000, 'approved')
on conflict (id) do nothing;

-- Funding Line Items
insert into funding_line_items (funding_request_id, description, vendor, unit_cost_cents, quantity, url)
values
  ('70000001-1111-1111-1111-111111111111', 'Gigavac GX14CA 400V 350A Contactor', 'Mouser Electronics', 18500, 2, 'https://www.mouser.com/gigavac-gx14'),
  ('70000001-1111-1111-1111-111111111111', 'Texas Instruments BQ79616-Q1 BMS Monitor ICs', 'DigiKey', 1150, 10, 'https://www.digikey.com/ti-bms'),
  ('70000002-2222-2222-2222-222222222222', '3K 2x2 Twill Carbon Fiber Fabric (5 yards)', 'Composite Envisions', 12500, 4, 'https://compositeenvisions.com/carbon-fabric'),
  ('70000002-2222-2222-2222-222222222222', 'West System 105 Epoxy Resin & 206 Slow Hardener (1 Gallon)', 'Aircraft Spruce', 25000, 1, 'https://www.aircraftspruce.com/epoxy')
on conflict do nothing;

-- 13. Work Logs
insert into work_logs (id, author_id, team_id, competition_id, body, hours_spent, blockers, visibility)
values
  ('90000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Completed routing for the CAN-bus transceiver harness and isolated DC-DC converter breakout board. Tested signal integrity with 120-ohm termination on the oscilloscope.', 4.5, 'Waiting on approved funding for Mouser high-voltage contactors.', 'team'),
  ('90000002-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '10000002-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ran Ansys Fluent CFD simulation on the 3-element front wing assembly at 45 mph. Downforce coefficient increased by 14% with the slotted flap profile.', 6.0, null, 'club'),
  ('90000003-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '10000001-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wrote unit tests for the battery state-of-charge Kalman filter estimator in C++. Simulated thermal throttling curves.', 3.0, null, 'team')
on conflict (id) do nothing;

-- 14. Links (Emphasized Hierarchy)
insert into links (id, label, url, description, tier, icon, sort_order, is_active)
values
  ('80000001-1111-1111-1111-111111111111', 'Club Discord Server', 'https://discord.gg/engineering-club', 'Our primary real-time communication hub for all subteams, announcements, and voice channels.', 'primary', 'MessageSquare', 1, true),
  ('80000002-2222-2222-2222-222222222222', 'SolidWorks & Altium Student Licenses', 'https://apex-eng-club.org/software-licenses', 'Access student CAD and EDA license keys provided by the engineering department sponsorship.', 'primary', 'Key', 2, true),
  ('80000003-3333-3333-3333-333333333333', 'Makerspace Safety Waiver & Certifications', 'https://safety.university.edu/makerspace-waiver', 'Mandatory safety protocol and certification status tracker required before using heavy machinery.', 'primary', 'ShieldAlert', 3, true),
  ('80000004-4444-4444-4444-444444444444', 'Club GitHub Organization', 'https://github.com/apex-eng-club', 'Shared repositories for firmware, ROS2 packages, telemetry dashboards, and hardware designs.', 'primary', 'Github', 4, true),

  ('80000005-5555-5555-5555-555555555555', '3D Print Queue & Material Requests', 'https://3dprint.university.edu/queue', 'Submit STL files for Markforged Onyx and Bambu Lab X1-Carbon printers.', 'secondary', 'Printer', 5, true),
  ('80000006-6666-6666-6666-666666666666', 'DigiKey Club Account Discount Portal', 'https://digikey.com/edu/discount', '15% educational discount for club purchases.', 'secondary', 'ShoppingBag', 6, true),
  ('80000007-7777-7777-7777-777777777777', 'Machine Shop Reservation Calendar', 'https://calendar.google.com/calendar/u/0?cid=shop_calendar', 'Book time on the Tormach CNC mill or manual lathe.', 'secondary', 'Calendar', 7, true),

  ('80000008-8888-8888-8888-888888888888', 'Club Constitution & Bylaws 2026-27', 'https://apex-eng-club.org/constitution.pdf', 'Official operational guidelines and election protocols.', 'resource', 'FileText', 8, true),
  ('80000009-9999-9999-9999-999999999999', 'University Travel Expense Policy Guidelines', 'https://finance.university.edu/travel-rules', 'Standard reimbursement limits for competition lodging and gas.', 'resource', 'Compass', 9, true)
on conflict (id) do nothing;

-- 15. Notifications
insert into notifications (id, user_id, kind, title, body, href, read_at)
values
  ('a0000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'welcome', 'Welcome to Apex Engineering Club! 🚀', 'Your member account is active. Check out the competitions and submit your team requests.', '/competitions', now() - interval '20 days'),
  ('a0000002-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'funding_approved', 'Funding Request Approved! 💰', 'Your funding request "Twill Weave Carbon Fiber Fabric & Epoxy Resin Infusion Kit" was approved ($750.00).', '/funding', null)
on conflict (id) do nothing;
