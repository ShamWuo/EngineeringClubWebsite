import { describe, it, expect } from 'vitest';
import { LAYERS, SPEC } from '@/components/landing/layers/config';
import { FAR_RIDGE, MID_RIDGE, FOOTHILLS, FOREGROUND_FIELD, fencePath } from '@/components/landing/layers/geometry';

describe('ridge geometry', () => {
  it('every ground path closes on the baseline so layers register', () => {
    for (const d of [FAR_RIDGE, MID_RIDGE, FOOTHILLS, FOREGROUND_FIELD]) {
      expect(d.startsWith('M')).toBe(true);
      expect(d.endsWith('L1440,640 L0,640 Z')).toBe(true);
    }
  });

  it('fence generates the expected slat rhythm within bounds', () => {
    const d = fencePath();
    const slats = d.match(/M-?\d+,548/g) ?? [];
    expect(slats.length).toBe(81);
    for (const s of slats) {
      const x = Number(s.slice(1, s.indexOf(',')));
      expect(x).toBeGreaterThanOrEqual(-8);
      expect(x).toBeLessThan(1448);
    }
  });
});

describe('layer depth invariants', () => {
  it('has eight uniquely-identified layers', () => {
    expect(LAYERS).toHaveLength(8);
    expect(new Set(LAYERS.map((l) => l.id)).size).toBe(8);
  });

  it('lag decreases and drift increases with nearness', () => {
    const ordered = LAYERS.filter((l) => l.id !== 'sun');
    for (let i = 1; i < ordered.length; i++) {
      for (const k of ['rise', 'delay', 'dur', 'z'] as const) {
        expect(ordered[i][k]).toBeGreaterThan(ordered[i - 1][k]);
      }
      expect(ordered[i].lag).toBeLessThan(ordered[i - 1].lag);      // near resists less
      expect(ordered[i].drift).toBeGreaterThan(ordered[i - 1].drift); // near swings more
    }
  });

  it('no layer outruns the page', () => {
    for (const l of LAYERS) {
      expect(l.lag).toBeGreaterThanOrEqual(0);
      expect(l.lag).toBeLessThanOrEqual(0.6);
    }
  });

  it('sun is the most distant layer', () => {
    const sun = SPEC.sun;
    expect(sun.lag).toBeGreaterThan(SPEC.far.lag);
    expect(sun.drift).toBeLessThan(SPEC.far.drift);
  });
});
