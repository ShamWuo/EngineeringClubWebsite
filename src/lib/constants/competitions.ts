export const ENGINEERING_DISCIPLINES = [
  'Aerospace Engineering',
  'Computer Engineering',
  'AI Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Software Engineering',
  'Robotics & Mechatronics',
  'Biomedical Engineering',
  'Civil & Environmental Engineering',
  'Materials & Chemical Engineering',
] as const;

export type EngineeringDiscipline = (typeof ENGINEERING_DISCIPLINES)[number];

export const COMPETITION_DISCIPLINES_MAP: Record<string, EngineeringDiscipline[]> = {
  'first-robotics-2027': [
    'Robotics & Mechatronics',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Software Engineering',
  ],
  'nasa-rover-challenge': [
    'Aerospace Engineering',
    'Mechanical Engineering',
    'Robotics & Mechatronics',
  ],
  'american-rocketry-2027': [
    'Aerospace Engineering',
    'Mechanical Engineering',
  ],
  'solar-car-challenge': [
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil & Environmental Engineering',
  ],
  'ftc-biobuzz-2026-27': [
    'Robotics & Mechatronics',
    'Mechanical Engineering',
    'Software Engineering',
  ],
  'vex-override-2026-27': [
    'Robotics & Mechatronics',
    'Computer Engineering',
    'Software Engineering',
  ],
  'zero-robotics-2026-27': [
    'Aerospace Engineering',
    'Software Engineering',
    'AI Engineering',
  ],
  'seaperch-international-2027': [
    'Robotics & Mechatronics',
    'Mechanical Engineering',
    'Electrical Engineering',
  ],
  'nasa-student-launch-2027': [
    'Aerospace Engineering',
    'Mechanical Engineering',
  ],
  'cyberpatriot-xviii-2026-27': [
    'Software Engineering',
    'Computer Engineering',
  ],
  'tsa-teams-2027': [
    'Mechanical Engineering',
    'Civil & Environmental Engineering',
    'Electrical Engineering',
  ],
  'samsung-solve-2026-27': [
    'AI Engineering',
    'Software Engineering',
    'Electrical Engineering',
    'Civil & Environmental Engineering',
  ],
  'co-science-bowl-2027': [
    'Materials & Chemical Engineering',
    'Biomedical Engineering',
    'Electrical Engineering',
  ],
  'fhs-maker-sprint-fall-2026': [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Robotics & Mechatronics',
  ],
  'denver-metro-engineering-expo-2027': [
    'Aerospace Engineering',
    'Mechanical Engineering',
    'Civil & Environmental Engineering',
  ],
  'congressional-app-challenge-2026': [
    'Software Engineering',
    'AI Engineering',
    'Computer Engineering',
  ],
  'imagine-cup-junior-2027': [
    'AI Engineering',
    'Software Engineering',
  ],
  'nasa-space-apps-2026': [
    'Software Engineering',
    'Aerospace Engineering',
    'AI Engineering',
  ],
  'picoctf-2027': [
    'Software Engineering',
    'Computer Engineering',
  ],
  'lemelson-mit-inventeams-2027': [
    'Mechanical Engineering',
    'Electrical Engineering',
    'Biomedical Engineering',
  ],
  'sourceamerica-design-challenge-2027': [
    'Biomedical Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
  ],
  'conrad-challenge-2027': [
    'Aerospace Engineering',
    'AI Engineering',
    'Biomedical Engineering',
    'Civil & Environmental Engineering',
  ],
  'nrl-colorado-combat-robotics-2027': [
    'Robotics & Mechatronics',
    'Mechanical Engineering',
    'Materials & Chemical Engineering',
  ],
  'cubes-in-space-2027': [
    'Aerospace Engineering',
    'Electrical Engineering',
    'Materials & Chemical Engineering',
  ],
  'm3-challenge-2027': [
    'Software Engineering',
    'AI Engineering',
    'Civil & Environmental Engineering',
  ],
  'cserf-isef-pipeline-2027': [
    'Robotics & Mechatronics',
    'Biomedical Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
  ],
};

/**
 * Returns the list of engineering disciplines associated with a competition.
 * Checks the slug mapping first, then any custom disciplines property,
 * and falls back to text keyword matching.
 */
export function getCompetitionDisciplines(comp: {
  slug?: string;
  name?: string;
  description?: string | null;
  disciplines?: string[] | null;
}): EngineeringDiscipline[] {
  if (comp.slug && COMPETITION_DISCIPLINES_MAP[comp.slug]) {
    return COMPETITION_DISCIPLINES_MAP[comp.slug];
  }

  if (Array.isArray(comp.disciplines) && comp.disciplines.length > 0) {
    return comp.disciplines.filter((d): d is EngineeringDiscipline =>
      (ENGINEERING_DISCIPLINES as readonly string[]).includes(d)
    );
  }

  // Keyword heuristic fallback
  const text = `${comp.name || ''} ${comp.description || ''}`.toLowerCase();
  const matched = new Set<EngineeringDiscipline>();

  if (/rocket|aerospace|aero|satellite|space|flight/i.test(text)) {
    matched.add('Aerospace Engineering');
  }
  if (/robot|mechatron|actuator|sensor|rover|autonomous/i.test(text)) {
    matched.add('Robotics & Mechatronics');
  }
  if (/cad|mechanical|mechanic|machin|chassis|structural|fabricat/i.test(text)) {
    matched.add('Mechanical Engineering');
  }
  if (/circuit|wire|pcb|power|electric|solar|battery/i.test(text)) {
    matched.add('Electrical Engineering');
  }
  if (/software|program|code|firmware|cyber|linux|c\+\+|algorithm/i.test(text)) {
    matched.add('Software Engineering');
  }
  if (/fpga|microprocessor|embedded|hardware|network|cisco/i.test(text)) {
    matched.add('Computer Engineering');
  }
  if (/ai|machine learning|vision|neural|model|intel/i.test(text)) {
    matched.add('AI Engineering');
  }
  if (/bio|medical|health|prosthetic/i.test(text)) {
    matched.add('Biomedical Engineering');
  }
  if (/civil|enviro|green|sustain|infra/i.test(text)) {
    matched.add('Civil & Environmental Engineering');
  }
  if (/material|chem|polymer|metal|composite/i.test(text)) {
    matched.add('Materials & Chemical Engineering');
  }

  return Array.from(matched);
}
