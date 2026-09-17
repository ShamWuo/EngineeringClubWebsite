export const VIEW_BOX = '0 0 1440 640';

/** Layer 1 — far ridge. Soft, hazy, low amplitude. */
export const FAR_RIDGE =
  'M0,300 L60,268 L140,214 L215,176 L290,142 L340,168 L420,214 L470,196 ' +
  'L520,232 L600,262 L640,240 L700,276 L780,300 L840,262 L900,214 L980,182 ' +
  'L1060,196 L1140,168 L1220,206 L1300,244 L1380,268 L1440,286 L1440,640 L0,640 Z';

/**
 * Layer 2 — the Flatirons. Deliberately jagged. The sharp notches at
 * x=392 and x=980 are the two signature slab peaks; keep them.
 */
export const MID_RIDGE =
  'M0,392 L90,364 L170,330 L240,352 L300,318 L356,346 L392,300 L436,346 ' +
  'L470,320 L520,364 L590,338 L640,368 L700,346 L760,378 L820,352 L880,306 ' +
  'L930,336 L980,300 L1030,340 L1090,318 L1150,352 L1220,336 L1300,370 ' +
  'L1380,356 L1440,382 L1440,640 L0,640 Z';

/** Layer 3 — foothills. Cubic curves only, no corners. */
export const FOOTHILLS =
  'M0,470 C120,452 220,438 330,446 C430,453 520,470 610,466 ' +
  'C700,462 780,442 880,436 C980,430 1080,444 1180,456 ' +
  'C1280,468 1370,462 1440,452 L1440,640 L0,640 Z';

/** Layer 4 — building massing, traced from the photo's silhouette. */
export const BUILDING = {
  gym: { x: 330, y: 452, w: 230, h: 108 },
  main: { x: 560, y: 486, w: 300, h: 74 },
  rightWing: { x: 860, y: 506, w: 220, h: 54 },
  stack: { x: 596, y: 430, w: 26, h: 56 },
  entry: { x: 690, y: 522, w: 46, h: 38 },
  windows: Array.from({ length: 4 }, (_, i) => ({
    x: 364 + i * 52,
    y: 470,
    w: 34,
    h: 22,
  })),
} as const;

/** Layer 5 — fence. Generated once at module scope; ~73 slats. */
export function fencePath(): string {
  const TOP = 548;
  const BOTTOM = 602;
  const W = 7;
  const GAP = 11;
  const slats: string[] = [];
  for (let x = -8; x < 1448; x += W + GAP) {
    slats.push(`M${x},${TOP} h${W} v${BOTTOM - TOP} h-${W} Z`);
  }
  return `M-8,542 h1456 v6 h-1456 Z ${slats.join(' ')}`;
}

export const FENCE = fencePath();

/** Layer 6 — foreground. */
export const FOREGROUND_FIELD =
  'M0,586 C240,572 520,596 760,588 C1000,580 1240,600 1440,590 L1440,640 L0,640 Z';

export const FOREGROUND_TREES = [
  { cx: 40, cy: 470, r: 96 },
  { cx: 128, cy: 496, r: 78 },
  { cx: 196, cy: 516, r: 58 },
  { cx: 92, cy: 540, r: 70 },
] as const;

/** Sun disc, behind everything. */
export const SUN = { cx: 1010, cy: 300, r: 120 } as const;

/** Clouds — thin flat-bottomed stratus bands, painted between far and mid. */
export const CLOUDS = [
  { cx: 300,  cy: 130, rx: 150, ry: 11, opacity: 0.5  },
  { cx: 700,  cy: 95,  rx: 110, ry: 8,  opacity: 0.38 },
  { cx: 1080, cy: 175, rx: 170, ry: 12, opacity: 0.45 },
  { cx: 500,  cy: 225, rx: 95,  ry: 7,  opacity: 0.3  },
  { cx: 1250, cy: 90,  rx: 80,  ry: 6,  opacity: 0.32 },
  { cx: 160,  cy: 235, rx: 70,  ry: 6,  opacity: 0.28 },
] as const;

/** Birds — a small scattered kettle. */
export const BIRDS = [
  { x: 880, y: 165, s: 1.15, f: true  },
  { x: 925, y: 178, s: 0.9,  f: false },
  { x: 960, y: 160, s: 1.0,  f: false },
  { x: 1180, y: 118, s: 0.75, f: false },
] as const;

/** Lateral shading on foothill folds (lit south-west). */
export const HILL_SHADE = [
  { x: 700, w: 130 },
  { x: 1040, w: 110 },
] as const;

/** Roof planes of the building — darker quads for volume. */
export const BUILDING_ROOF_SHADES = [
  { x: 330, y: 452, w: 230, h: 7 },   // gym roof edge
  { x: 860, y: 506, w: 220, h: 5 },   // right wing roof edge
] as const;

/** Left-face shading strips (simple ambient occlusion on the west side). */
export const BUILDING_SIDE_SHADES = [
  { x: 330, y: 452, w: 10, h: 108 },  // gym west face
  { x: 560, y: 486, w: 8, h: 74 },    // main west face
] as const;
