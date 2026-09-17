export type LayerId = 'sun' | 'far' | 'clouds' | 'mid' | 'hills' | 'building' | 'fence' | 'fore';

export interface LayerSpec {
  id: LayerId;
  rise: number;    // entrance travel, px
  delay: number;   // entrance delay, ms
  dur: number;     // entrance duration, ms
  lag: number;     // scroll resistance — HIGH = far/pinned
  drift: number;   // pointer sensitivity — HIGH = near
  z: number;
}

// Depth order: sun < far < clouds < mid < hills < building < fence < fore.
// lag decreases toward the viewer (near layers resist less); drift increases
// toward the viewer (near layers swing more with the pointer).
export const LAYERS: readonly LayerSpec[] = [
  { id: 'sun',      rise: 220, delay:   0, dur: 1800, lag: 0.50, drift: 0.010, z:  5 },
  { id: 'far',      rise:  24, delay:  60, dur: 1100, lag: 0.45, drift: 0.020, z: 10 },
  { id: 'clouds',   rise:  34, delay: 110, dur: 1150, lag: 0.40, drift: 0.038, z: 11 },
  { id: 'mid',      rise:  44, delay: 150, dur: 1200, lag: 0.36, drift: 0.055, z: 12 },
  { id: 'hills',    rise:  70, delay: 240, dur: 1300, lag: 0.26, drift: 0.110, z: 15 },
  { id: 'building', rise: 100, delay: 360, dur: 1400, lag: 0.14, drift: 0.180, z: 25 },
  { id: 'fence',    rise: 130, delay: 460, dur: 1450, lag: 0.07, drift: 0.260, z: 28 },
  { id: 'fore',     rise: 170, delay: 540, dur: 1550, lag: 0.00, drift: 0.340, z: 30 },
] as const;

export const SPEC = Object.fromEntries(
  LAYERS.map((l) => [l.id, l]),
) as Record<LayerId, LayerSpec>;
