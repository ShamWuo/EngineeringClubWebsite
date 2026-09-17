import type { Database, UserRole, CompStatus, WorkshopStatus, RequestStatus, FundingStatus, LinkTier, TeamRole, WorkLogVisibility } from './types';

export interface AppState {
  profiles: Database['public']['Tables']['profiles']['Row'][];
  competitions: Database['public']['Tables']['competitions']['Row'][];
  teams: Database['public']['Tables']['teams']['Row'][];
  team_members: Database['public']['Tables']['team_members']['Row'][];
  competition_signups: Database['public']['Tables']['competition_signups']['Row'][];
  team_requests: Database['public']['Tables']['team_requests']['Row'][];
  competition_requests: Database['public']['Tables']['competition_requests']['Row'][];
  workshops: Database['public']['Tables']['workshops']['Row'][];
  workshop_rsvps: Database['public']['Tables']['workshop_rsvps']['Row'][];
  workshop_requests: Database['public']['Tables']['workshop_requests']['Row'][];
  workshop_request_votes: Database['public']['Tables']['workshop_request_votes']['Row'][];
  funding_requests: Database['public']['Tables']['funding_requests']['Row'][];
  funding_line_items: Database['public']['Tables']['funding_line_items']['Row'][];
  funding_attachments: Database['public']['Tables']['funding_attachments']['Row'][];
  general_requests: Database['public']['Tables']['general_requests']['Row'][];
  work_logs: Database['public']['Tables']['work_logs']['Row'][];
  links: Database['public']['Tables']['links']['Row'][];
  notifications: Database['public']['Tables']['notifications']['Row'][];
  audit_log: Database['public']['Tables']['audit_log']['Row'][];
  club_settings: Database['public']['Tables']['club_settings']['Row'];
}

export function getInitialMockData(): AppState {
  const now = new Date();

  return {
    general_requests: [],
    club_settings: {
      id: 'default',
      club_name: 'Fairview High School Engineering Club',
      allowed_email_domain: 'bvsd.org',
      budget_ceiling_cents: 5000000,
      updated_at: now.toISOString(),
      updated_by: null,
    },
    profiles: [],
    competitions: [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        slug: 'first-robotics-2027',
        name: 'FIRST Robotics Competition 2027',
        description: 'The premier international high school robotics challenge. Teams design, CNC-machine, wire, and program industrial-grade 125-lb robots in an intensive build cycle to compete in the 2027 field game. Features advanced swerve drive, pneumatic actuators, machine vision tracking, and alliance tournament play.',
        organizer: 'FIRST (For Inspiration & Recognition of Science & Technology)',
        status: 'active',
        season: '2026-27',
        registration_opens_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        registration_closes_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        event_starts_at: new Date(Date.now() + 90 * 86400000).toISOString(),
        event_ends_at: new Date(Date.now() + 94 * 86400000).toISOString(),
        max_teams: 2,
        max_team_size: 35,
        entry_fee_cents: 600000,
        external_url: 'https://www.firstinspires.org/robotics/frc',
        created_by: null,
        created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        slug: 'nasa-rover-challenge',
        name: 'NASA Human Exploration Rover Challenge 2027',
        description: 'Design, fabricate, and pilot a human-powered collapsible rover capable of traversing a rugged half-mile simulated lunar and Martian obstacle course at the U.S. Space & Rocket Center in Huntsville, AL. Teams complete real-time core sampling and equipment deployment while meeting strict telemetry and safety standards.',
        organizer: 'NASA Marshall Space Flight Center',
        status: 'active',
        season: '2026-27',
        registration_opens_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        registration_closes_at: new Date(Date.now() + 15 * 86400000).toISOString(),
        event_starts_at: new Date(Date.now() + 120 * 86400000).toISOString(),
        event_ends_at: new Date(Date.now() + 124 * 86400000).toISOString(),
        max_teams: 2,
        max_team_size: 8,
        entry_fee_cents: 0,
        external_url: 'https://www.nasa.gov/roverchallenge',
        created_by: null,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        slug: 'american-rocketry-2027',
        name: 'American Rocketry Challenge 2027',
        description: "The world's largest student aerospace contest. High school teams engineer and launch dual-stage or high-power model rockets carrying two raw Grade A eggs to exactly 800 feet with a flight duration of 37–40 seconds, returning payload and motor stages undamaged via dual-parachute recovery.",
        organizer: 'Aerospace Industries Association & NAR',
        status: 'planned',
        season: '2026-27',
        registration_opens_at: new Date(Date.now() + 10 * 86400000).toISOString(),
        registration_closes_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        event_starts_at: new Date(Date.now() + 180 * 86400000).toISOString(),
        event_ends_at: new Date(Date.now() + 182 * 86400000).toISOString(),
        max_teams: 3,
        max_team_size: 10,
        entry_fee_cents: 15000,
        external_url: 'https://rocketrychallenge.org',
        created_by: null,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        slug: 'solar-car-challenge',
        name: 'National Solar Car Challenge',
        description: 'High school engineering teams design, build, and race full-scale roadworthy solar-electric vehicles. Squads engineer custom tubular steel roll cages, MPPT solar charging arrays, active lithium battery management systems (BMS), and composite aerodynamic fairings to race at the Texas Motor Speedway.',
        organizer: 'Solar Car Challenge Foundation',
        status: 'completed',
        season: '2025-26',
        registration_opens_at: new Date(Date.now() - 300 * 86400000).toISOString(),
        registration_closes_at: new Date(Date.now() - 250 * 86400000).toISOString(),
        event_starts_at: new Date(Date.now() - 100 * 86400000).toISOString(),
        event_ends_at: new Date(Date.now() - 96 * 86400000).toISOString(),
        max_teams: 1,
        max_team_size: 15,
        entry_fee_cents: 80000,
        external_url: 'https://www.solarcarchallenge.org',
        created_by: null,
        created_at: new Date(Date.now() - 310 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    teams: [
      {
        id: '10000001-1111-1111-1111-111111111111',
        competition_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'FHS Knights FRC Drivetrain & Chassis',
        description: 'Precision swerve drive kinematics, CNC routed structural aluminum bellypan, and 125-lb competition chassis fabrication.',
        is_recruiting: true,
        created_by: null,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '10000002-2222-2222-2222-222222222222',
        competition_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'FHS Knights FRC Intake & Manipulation',
        description: 'Active roller intake mechanisms, pneumatic indexing systems, brushless flywheel velocity control, and machine vision targeting.',
        is_recruiting: true,
        created_by: null,
        created_at: new Date(Date.now() - 22 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '10000003-3333-3333-3333-333333333333',
        competition_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'FHS Knights Lunar Rover Alpha',
        description: 'Primary rover chassis and drivetrain subteam focused on lightweight chromoly frame geometry, custom suspension linkage, and 3D-printed airless tire compliant treads.',
        is_recruiting: false,
        created_by: null,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    team_members: [],
    competition_signups: [],
    team_requests: [],
    competition_requests: [],
    workshops: [
      {
        id: '50000001-1111-1111-1111-111111111111',
        slug: 'solidworks-advanced-surfacing',
        title: 'Mastering Surface Modeling in SolidWorks',
        description: 'Deep dive into complex boundary surfaces, lofts, tangency curvature continuity (G2), and ergonomic handheld enclosures.',
        instructor_id: null,
        instructor_name: 'Staff Instructor',
        status: 'scheduled',
        starts_at: new Date(Date.now() + 3 * 86400000 + 2 * 3600000).toISOString(),
        ends_at: new Date(Date.now() + 3 * 86400000 + 4 * 3600000).toISOString(),
        location: 'FHS Makerspace & Zoom',
        capacity: 30,
        skill_level: 'Intermediate',
        materials_url: 'https://github.com/fhs-engineering/solidworks-workshop',
        recording_url: null,
        created_by: null,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '50000002-2222-2222-2222-222222222222',
        slug: 'kicad-pcb-design-crashcourse',
        title: 'From Schematic to 4-Layer PCB in KiCad',
        description: 'Learn component footprint selection, differential pair routing, ground planes, impedance matching, and Gerber export.',
        instructor_id: null,
        instructor_name: 'Electronics Lead',
        status: 'scheduled',
        starts_at: new Date(Date.now() + 7 * 86400000 + 3 * 3600000).toISOString(),
        ends_at: new Date(Date.now() + 7 * 86400000 + 5 * 3600000).toISOString(),
        location: 'FHS Electronics Lab',
        capacity: 20,
        skill_level: 'Beginner to Intermediate',
        materials_url: 'https://github.com/fhs-engineering/kicad-templates',
        recording_url: null,
        created_by: null,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '50000003-3333-3333-3333-333333333333',
        slug: 'intro-to-lathe-and-cnc-mill',
        title: 'Shop Safety: CNC Mill & Manual Lathe Certification',
        description: 'Hands-on safety protocol, feeds & speeds, tooling offset zeroing, and emergency stop operational training.',
        instructor_id: null,
        instructor_name: 'Shop Supervisor',
        status: 'completed',
        starts_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        ends_at: new Date(Date.now() - 14 * 86400000 + 3 * 3600000).toISOString(),
        location: 'FHS Machine Shop',
        capacity: 15,
        skill_level: 'All Levels',
        materials_url: 'https://fhs-engineering.org/safety-docs',
        recording_url: 'https://youtube.com/watch?v=mock-cnc-recording',
        created_by: null,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    workshop_rsvps: [],
    workshop_requests: [],
    workshop_request_votes: [],
    funding_requests: [],
    funding_line_items: [],
    funding_attachments: [],
    work_logs: [],
    links: [
      {
        id: '80000001-1111-1111-1111-111111111111',
        label: 'Club Discord Server',
        url: 'https://discord.gg/engineering-club',
        description: 'Our primary real-time communication hub for all subteams, announcements, and voice channels.',
        tier: 'primary',
        icon: 'MessageSquare',
        sort_order: 1,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000002-2222-2222-2222-222222222222',
        label: 'SolidWorks & Altium Student Licenses',
        url: 'https://fhs-engineering.org/software-licenses',
        description: 'Access student CAD and EDA license keys provided by the engineering department sponsorship.',
        tier: 'primary',
        icon: 'Key',
        sort_order: 2,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000003-3333-3333-3333-333333333333',
        label: 'Makerspace Safety Waiver & Certifications',
        url: 'https://safety.fhs-engineering.org/makerspace-waiver',
        description: 'Mandatory safety protocol and certification status tracker required before using heavy machinery.',
        tier: 'primary',
        icon: 'ShieldAlert',
        sort_order: 3,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000004-4444-4444-4444-444444444444',
        label: 'Club GitHub Organization',
        url: 'https://github.com/fhs-engineering',
        description: 'Shared repositories for firmware, ROS2 packages, telemetry dashboards, and hardware designs.',
        tier: 'primary',
        icon: 'Github',
        sort_order: 4,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000005-5555-5555-5555-555555555555',
        label: '3D Print Queue & Material Requests',
        url: 'https://3dprint.fhs-engineering.org/queue',
        description: 'Submit STL files for Markforged Onyx and Bambu Lab X1-Carbon printers.',
        tier: 'secondary',
        icon: 'Printer',
        sort_order: 5,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000006-6666-6666-6666-666666666666',
        label: 'DigiKey Club Account Discount Portal',
        url: 'https://digikey.com/edu/discount',
        description: '15% educational discount for club purchases.',
        tier: 'secondary',
        icon: 'ShoppingBag',
        sort_order: 6,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000007-7777-7777-7777-777777777777',
        label: 'Machine Shop Reservation Calendar',
        url: 'https://calendar.google.com/calendar/u/0?cid=shop_calendar',
        description: 'Book time on the Tormach CNC mill or manual lathe.',
        tier: 'secondary',
        icon: 'Calendar',
        sort_order: 7,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000008-8888-8888-8888-888888888888',
        label: 'Club Constitution & Bylaws 2026-27',
        url: 'https://fhs-engineering.org/constitution.pdf',
        description: 'Official operational guidelines and election protocols.',
        tier: 'resource',
        icon: 'FileText',
        sort_order: 8,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
      {
        id: '80000009-9999-9999-9999-999999999999',
        label: 'FHS Engineering Travel & Reimbursement Policy',
        url: 'https://finance.fhs-engineering.org/travel-rules',
        description: 'Standard reimbursement limits for competition lodging and gas.',
        tier: 'resource',
        icon: 'Compass',
        sort_order: 9,
        is_active: true,
        updated_by: null,
        updated_at: new Date().toISOString(),
      },
    ],
    notifications: [],
    audit_log: [],
  };
}

// The store must live on globalThis: Next.js bundles this module separately per
// route, so a module-level variable would give every page its own isolated copy
// (breaking sessions and any cross-route state). globalThis is shared per process.
const GLOBAL_STORE_KEY = '__fhs_engineering_app_state__';

function readGlobalStore(): AppState | null {
  return ((globalThis as any)[GLOBAL_STORE_KEY] as AppState | undefined) ?? null;
}

function writeGlobalStore(store: AppState) {
  (globalThis as any)[GLOBAL_STORE_KEY] = store;
}

export function getDb(): AppState {
  let store = readGlobalStore();
  if (!store) {
    store = getInitialMockData();
    writeGlobalStore(store);
  }
  return store;
}

export function resetDb() {
  const store = getInitialMockData();
  writeGlobalStore(store);
  return store;
}
