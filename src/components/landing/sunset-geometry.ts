export const VIEW_BOX = '0 0 1440 720';

/**
 * Sun position in viewbox coordinates.
 * Nestled low in the right mountain notch (x: 1040, y: 460)
 * so it anchors the golden radiance across the entire horizon.
 */
export const SUN_SPEC = {
  cx: 1040,
  cy: 460,
  r: 105,
  haloR1: 180,
  haloR2: 320,
  haloR3: 500,
} as const;

/**
 * Layer 1: Far 3D Alpine Peaks (Continental Divide & Longs Peak)
 * High-altitude jagged peaks (crests y: 410..470), leaving >60% of the canvas for the sky.
 */
export const FAR_PEAKS_BASE =
  'M0,500 ' +
  'L90,460 L180,480 L280,425 L360,458 L460,430 L550,465 L670,418 ' +
  'L750,455 L850,410 L930,442 L1020,388 L1110,435 L1200,415 L1290,448 ' +
  'L1370,428 L1440,455 L1440,720 L0,720 Z';

/** Sun-facing facets (illuminated by sunset gold and alpine rose) */
export const FAR_PEAKS_LIT = [
  'M280,425 L360,458 L325,495 L280,425 Z',
  'M460,430 L550,465 L515,502 L460,430 Z',
  'M670,418 L750,455 L720,498 L670,418 Z',
  'M850,410 L930,442 L895,500 L850,410 Z',
  // Longs Peak dramatic summit facet
  'M1020,388 L1110,435 L1070,495 L1020,388 Z',
  'M1200,415 L1290,448 L1255,496 L1200,415 Z',
  'M1370,428 L1440,455 L1415,500 L1370,428 Z',
];

/** Shadow facets (facing away from sunset, atmospheric dusk violet) */
export const FAR_PEAKS_SHADOW = [
  'M180,480 L280,425 L280,495 L180,480 Z',
  'M360,458 L460,430 L430,498 L360,458 Z',
  'M550,465 L670,418 L640,496 L550,465 Z',
  'M750,455 L850,410 L830,500 L750,455 Z',
  'M930,442 L1020,388 L995,495 L930,442 Z',
  'M1110,435 L1200,415 L1175,496 L1110,435 Z',
  'M1290,448 L1370,428 L1345,500 L1290,448 Z',
];

/** Snow-cap and knife-edge ridge highlights */
export const FAR_PEAKS_SNOW = [
  // Summit snow patches
  'M1020,388 L1045,410 L1015,412 Z',
  'M850,410 L870,428 L845,426 Z',
  'M670,418 L690,435 L665,432 Z',
  'M280,425 L300,442 L275,440 Z',
];

/**
 * Layer 2: Midground Boulder Flatirons & Forest Foothills
 * Angled sandstone slabs (crests y: 490..560) with deep pine forest.
 */
export const MID_RIDGE_BASE =
  'M0,555 ' +
  'L75,525 L135,545 L195,512 L245,536 L305,502 L355,530 L405,492 ' +
  'L455,526 L515,504 L575,538 L635,516 L705,548 L775,522 L845,552 ' +
  'L915,526 L975,555 L1045,524 L1115,552 L1195,528 L1275,558 L1355,534 L1440,560 ' +
  'L1440,720 L0,720 Z';

/** Flatirons sandstone slab faces (angled 55 degrees, catching golden rim light) */
export const FLATIRON_SLABS = [
  // First Flatiron
  'M195,512 L245,536 L228,578 L180,560 Z',
  // Second Flatiron
  'M305,502 L355,530 L338,575 L290,554 Z',
  // Third Flatiron (Tallest iconic slab)
  'M405,492 L455,526 L435,580 L388,552 Z',
  // Fourth Flatiron
  'M515,504 L575,538 L552,586 L498,560 Z',
  // South Flatiron fins
  'M915,526 L975,555 L952,596 L898,572 Z',
  'M1045,524 L1115,552 L1092,592 L1028,570 Z',
];

/** Sharp glowing crest stroke */
export const MID_RIDGE_CREST =
  'M0,555 ' +
  'L75,525 L135,545 L195,512 L245,536 L305,502 L355,530 L405,492 ' +
  'L455,526 L515,504 L575,538 L635,516 L705,548 L775,522 L845,552 ' +
  'L915,526 L975,555 L1045,524 L1115,552 L1195,528 L1275,558 L1355,534 L1440,560';

/**
 * Layer 3: Foreground Plains & Prairie Horizon
 * Ground occupies only the bottom 16–18% of the viewport (crest y: 595..625),
 * leaving the expansive sunset sky to dominate the view.
 */
export const FOREGROUND_BASE =
  'M0,618 ' +
  'C220,605 440,624 680,610 ' +
  'C920,598 1160,620 1440,608 ' +
  'L1440,720 L0,720 Z';

export const FOREGROUND_SHELF =
  'M0,648 ' +
  'C320,636 640,654 960,640 ' +
  'C1180,630 1340,645 1440,638 ' +
  'L1440,720 L0,720 Z';

/** Pine tree silhouettes placed along the midground and foreground crests */
export const PINE_SILHOUETTES = [
  // Midground trees
  { x: 70,  y: 525, h: 22, w: 8 },
  { x: 130, y: 545, h: 18, w: 7 },
  { x: 240, y: 536, h: 20, w: 7 },
  { x: 350, y: 530, h: 24, w: 9 },
  { x: 450, y: 526, h: 22, w: 8 },
  { x: 570, y: 538, h: 26, w: 10 },
  { x: 630, y: 516, h: 21, w: 8 },
  { x: 770, y: 522, h: 24, w: 9 },
  { x: 840, y: 552, h: 20, w: 7 },
  { x: 970, y: 555, h: 22, w: 8 },
  { x: 1110, y: 552, h: 25, w: 9 },
  { x: 1270, y: 558, h: 20, w: 7 },
  { x: 1350, y: 534, h: 24, w: 9 },
  // Foreground trees
  { x: 120, y: 612, h: 32, w: 12 },
  { x: 240, y: 608, h: 28, w: 10 },
  { x: 400, y: 616, h: 36, w: 14 },
  { x: 560, y: 612, h: 30, w: 11 },
  { x: 760, y: 604, h: 34, w: 13 },
  { x: 900, y: 600, h: 38, w: 15 },
  { x: 1100, y: 614, h: 32, w: 12 },
  { x: 1300, y: 610, h: 36, w: 14 },
] as const;

/**
 * Organic Vector Cloud Sweeps:
 * Cirrus sweeps and billowy sunset cloud banks catching warm golden/coral light.
 * Positioned on the left and right flanks so the central headline remains clean and open.
 */
export const ORGANIC_CLOUDS = [
  // Upper left twilight cirrus sweep
  {
    d: 'M-40,95 C60,65 180,60 320,80 C440,96 520,130 580,110 C460,140 320,115 180,105 C80,98 -20,115 -40,95 Z',
    fill: 'rgba(244, 63, 94, 0.32)',
    rimStroke: 'rgba(251, 146, 60, 0.45)',
  },
  // Upper right twilight cirrus sweep
  {
    d: 'M880,85 C980,60 1140,55 1300,75 C1400,90 1480,115 1520,105 C1420,125 1300,105 1160,95 C1040,88 940,105 880,85 Z',
    fill: 'rgba(251, 113, 133, 0.28)',
    rimStroke: 'rgba(253, 186, 116, 0.4)',
  },
  // Mid-left sunset cloud bank
  {
    d: 'M-20,175 C80,140 200,135 340,158 C420,172 490,162 560,180 C470,205 360,192 240,186 C120,182 40,200 -20,175 Z',
    fill: 'rgba(249, 115, 22, 0.38)',
    rimStroke: 'rgba(254, 240, 138, 0.55)',
  },
  // Mid-right golden cloud bank (near sun)
  {
    d: 'M920,190 C1040,155 1180,150 1320,172 C1410,186 1480,178 1520,195 C1440,220 1320,208 1200,202 C1080,198 990,218 920,190 Z',
    fill: 'rgba(251, 146, 60, 0.42)',
    rimStroke: 'rgba(254, 240, 138, 0.65)',
  },
  // Lower warm horizon cloud tier
  {
    d: 'M40,280 C160,250 300,248 440,270 C520,282 580,275 660,290 C560,314 440,305 320,300 C180,296 90,312 40,280 Z',
    fill: 'rgba(245, 158, 11, 0.45)',
    rimStroke: 'rgba(254, 240, 138, 0.75)',
  },
  {
    d: 'M820,270 C960,238 1120,235 1280,258 C1370,272 1440,265 1500,282 C1410,306 1280,296 1140,290 C990,286 890,304 820,270 Z',
    fill: 'rgba(251, 191, 36, 0.50)',
    rimStroke: 'rgba(255, 255, 255, 0.85)',
  },
] as const;

/** Soaring birds heading high into the upper twilight sky */
export const SUNSET_BIRDS = [
  { x: 1180, y: 110, s: 0.9 },
  { x: 1220, y: 125, s: 0.75 },
  { x: 1255, y: 105, s: 0.8 },
  { x: 1330, y: 90,  s: 0.65 },
] as const;
