> **Superseded for all further work.** This document specifies the build that shipped.
> The scene it describes is live, and four defects were found in review. Do not implement
> from this file — see [`landing-page-v2-plan.md`](landing-page-v2-plan.md), which supersedes
> it and carries the corrected motion model, layout model, and verification procedure.
> Kept for the geometry rationale and the original design thesis only.

# Agent Brief — "The Ridge" landing page

**Reader:** an implementing coding agent with write access to this repo.
**Goal:** replace the hero of `src/app/(public)/page.tsx` with a full-bleed vector scene of the
Fairview HS / Flatirons skyline, built from 7 flat SVG layers that rise upward into place on load
and parallax on scroll. Palette: white / gray / black, with red reserved for the school building
and the ridge crest lines.

This brief is a specification, not a sketch. Source for every new file is given in full. Where a
value is specified (a coordinate, a delay, a z-index), use that value — do not re-derive it.

---

## 0. Constraints — read before writing any code

**MUST NOT:**
- Add any dependency. No framer-motion, GSAP, three.js, lottie, canvas, or WebGL. The entire
  effect is CSS keyframes + inline SVG.
- Create a `public/` directory or add raster image assets. There are none in this repo today.
- Modify anything under `src/lib/db/`, `src/actions/`, `src/lib/supabase/`, or `src/middleware.ts`.
- Convert `src/app/(public)/page.tsx` or `src/app/(public)/layout.tsx` into Client Components.
  `layout.tsx` is `async` and calls `getCurrentUser()`; it must stay a Server Component.
- Merge the entrance transform and the parallax transform onto one element. See §5, Rule 1.

**MUST:**
- Keep `page.tsx` a Server Component. Only `ridge-scene.tsx`, `use-parallax.ts`, and `count-up.tsx`
  carry `'use client'`.
- Keep the existing data flow in `page.tsx` (`getDb()`, the competitions/workshops/stats derivation)
  byte-identical. Only the JSX around it changes.
- Support light and dark themes. The app uses `darkMode: 'class'` with a `.dark` class on `<html>`,
  set by an inline script in `src/app/layout.tsx`. Theme is switched at runtime without a reload,
  so all layer colors must be CSS custom properties — never hardcoded per-theme Tailwind classes
  inside the SVGs.
- Support `prefers-reduced-motion: reduce` (§5.4). The scene must compose correctly with zero motion.
- Render fully without JavaScript. The scene is server-rendered SVG; only the parallax and the
  stat count-up are client behaviors, and both are enhancements.

**Repo facts you will need:**
- Next.js 15 App Router, React 19, Tailwind 3.4, TypeScript strict mode.
- `cn()` is exported from `src/components/ui/button.tsx` (not from a `lib/utils`). Import it there.
- Path alias `@/*` → `./src/*`, configured in both `tsconfig.json` and `vitest.config.ts`.
- Vitest runs with `environment: 'node'`. New tests must be pure-module tests — no DOM, no JSX.
- `tailwind.config.ts` already extends `zinc.850`, a `brand` red scale, `text-2xs`/`text-3xs`, and
  `shadow-2xs`. Add to `theme.extend`; do not replace it.

---

## 1. Scene model

Seven layers, back to front. Each is one `<svg>` element, absolutely positioned, stacked in one
`relative` container.

| z | id | Subject | Character |
|---|----|---------|-----------|
| 5  | `sun` | red disc behind the ridges | rises furthest and slowest |
| 10 | `far` | Bear Peak / S. Boulder Peak | smooth, hazy, low amplitude |
| 12 | `mid` | the Flatirons slabs | jagged; the signature shape |
| 15 | `hills` | foothills / treeline | rolling cubic curves |
| 25 | `building` | the FHS complex | rectilinear massing, **the only red mass** |
| 28 | `fence` | the slatted fence | repeating vertical rhythm |
| 30 | `fore` | left tree cluster + field | closest, pure black |

Hero copy sits at **z-20**, i.e. between `hills` and `building`. The building, fence, and foreground
overlap the lower edge of the headline. This overlap is the point of the design — do not raise the
copy above z-25 to "fix" it.

**Registration rule:** every layer uses the identical `viewBox="0 0 1440 640"` and
`preserveAspectRatio="xMidYMax slice"`, and every closed ground path terminates with
`L1440,640 L0,640 Z`. Identical box + identical fit rule = pixel-locked alignment at any container
size. `xMidYMax` anchors to the bottom so the horizon holds as the viewport shortens.

---

## 2. `src/components/landing/layers/geometry.ts`

Pure data and generators. No React, no imports. Write it exactly as follows.

```ts
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
```

The tree circles are drawn overlapping in a single `<g>` with one fill — they union visually. Do not
attempt a boolean union.

---

## 3. `src/components/landing/layers/config.ts`

Single source of truth for depth. Every motion value derives from this table.

```ts
export type LayerId = 'sun' | 'far' | 'mid' | 'hills' | 'building' | 'fence' | 'fore';

export interface LayerSpec {
  id: LayerId;
  /** Entrance travel distance in px. */
  rise: number;
  /** Entrance delay in ms. */
  delay: number;
  /** Entrance duration in ms. */
  dur: number;
  /** Scroll/pointer parallax multiplier. */
  speed: number;
  /** Stacking order within the scene. */
  z: number;
}

export const LAYERS: readonly LayerSpec[] = [
  { id: 'sun',      rise: 220, delay:   0, dur: 1800, speed: 0.010, z:  5 },
  { id: 'far',      rise:  24, delay:  60, dur: 1100, speed: 0.020, z: 10 },
  { id: 'mid',      rise:  44, delay: 150, dur: 1200, speed: 0.055, z: 12 },
  { id: 'hills',    rise:  70, delay: 240, dur: 1300, speed: 0.110, z: 15 },
  { id: 'building', rise: 100, delay: 360, dur: 1400, speed: 0.180, z: 25 },
  { id: 'fence',    rise: 130, delay: 460, dur: 1450, speed: 0.260, z: 28 },
  { id: 'fore',     rise: 170, delay: 540, dur: 1550, speed: 0.340, z: 30 },
] as const;

/** Layers dropped below 640px viewport width. */
export const MOBILE_OMIT: readonly LayerId[] = ['sun', 'mid'];

export const SPEC = Object.fromEntries(
  LAYERS.map((l) => [l.id, l]),
) as Record<LayerId, LayerSpec>;
```

**Invariant (enforced by test):** from index 1 onward (`far` … `fore`), `rise`, `delay`, `dur`,
`speed`, and `z` are each strictly increasing. `sun` is the deliberate exception — it rises furthest
and slowest so it is still climbing after the ridges have settled. Any other inversion destroys the
depth illusion.

Easing is `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) everywhere. Do not substitute an easing with
overshoot; a bounce reads as cartoonish against a mountain silhouette.

---

## 4. Color — `src/app/globals.css`

Append to the end of the file. Do not modify the existing `@layer base` block or the scrollbar rules.

```css
/* ── Landing scene ─────────────────────────────────────────────── */

.ridge-scene {
  --sky-top: #ffffff;
  --sky-bottom: #f4f4f5;
  --l-far: #d4d4d8;
  --l-mid: #71717a;
  --l-hills: #3f3f46;
  --l-building: #dc2626;
  --l-window: #ffffff;
  --l-fence: #18181b;
  --l-fore: #000000;
  --sun-fill: rgb(239 68 68 / 0.18);
  --crest: 0;
}

.dark .ridge-scene {
  --sky-top: #000000;
  --sky-bottom: #0a0a0b;
  --l-far: #27272a;
  --l-mid: #1f1f22;
  --l-hills: #18181b;
  --l-building: #dc2626;
  --l-window: #fca5a5;
  --l-fence: #000000;
  --l-fore: #000000;
  --sun-fill: rgb(220 38 38 / 0.34);
  --crest: 0.55;
}

.ridge-crest {
  stroke: rgb(220 38 38 / var(--crest));
  stroke-width: 2;
  stroke-linejoin: round;
}

.ridge-parallax {
  transform: translate3d(
    calc(var(--px, 0) * var(--speed) * 1px),
    calc(var(--scroll, 0) * var(--speed) * 1px),
    0
  );
}

@media (prefers-reduced-motion: reduce) {
  .animate-rise {
    animation: ridge-fade 400ms ease-out both !important;
  }
  .ridge-parallax {
    transform: none !important;
  }
}
```

**The crest strokes are load-bearing, not decoration.** In dark mode `--l-hills`, `--l-fence`, and
`--l-fore` are all effectively black; the red crest is the only thing separating them. It reads as
sunrise rimlight and is the most distinctive detail in the composition. Verify dark mode before
marking any task done.

Ordering rationale for the color ramp: atmospheric perspective. Light mode goes light→dark with
nearness; dark mode inverts to `#27272a` → `#1f1f22` → `#18181b` → `#000`. Both are monotonic.

---

## 5. Motion — hard rules

**Rule 1 — two nested elements, never one.** The `rise` keyframes animate `transform`, and the
parallax also writes `transform`. A running animation wins over an inline style on the same
element, so parallax would be dead until the entrance finished. Structure is therefore:

```
<div class="animate-rise">      ← entrance transform (CSS animation)
  <div class="ridge-parallax">  ← parallax transform (CSS var math)
    <svg>…</svg>
```

Both are compositor-only. Do not attempt to combine them.

**Rule 2 — `both` fill mode is required** on the `rise` animation. Without it, every layer flashes
at its final position for one frame before its delay elapses.

**Rule 3 — one listener, one variable.** The scroll handler writes a single unitless `--scroll` on
the scene root. Layers inherit it and do the multiplication in CSS. Never write per-layer styles
from JS in a scroll handler.

**Rule 4 — reduced motion is gated in JS as well as CSS.** The CSS block neutralizes the transform,
but the listeners must not attach at all.

### 5.4 `tailwind.config.ts`

Add to `theme.extend` — keep every existing key:

```ts
keyframes: {
  rise: {
    from: { transform: 'translate3d(0, var(--rise), 0)', opacity: '0' },
    to: { transform: 'translate3d(0, 0, 0)', opacity: '1' },
  },
  'ridge-fade': {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
},
animation: {
  rise: 'rise 1200ms cubic-bezier(0.16,1,0.3,1) both',
},
```

The `1200ms` in the shorthand is a fallback. Per-layer `animationDuration` and `animationDelay` are
set inline, and inline style beats the class's shorthand longhands. `ridge-fade` is referenced only
from the reduced-motion CSS block, so it must be listed in `keyframes` but needs no `animation` entry.

---

## 6. `src/components/landing/use-parallax.ts`

```ts
'use client';

import { useEffect, useRef } from 'react';

/**
 * Writes --scroll (px, unitless) and --px (pointer offset, unitless) onto the
 * returned element. Layers consume them via CSS calc. One rAF-throttled
 * listener pair; detaches while the scene is off-screen.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let ticking = false;
    let attached = false;

    const write = (scrollY: number, px: number | null) => {
      el.style.setProperty('--scroll', String(scrollY));
      if (px !== null) el.style.setProperty('--px', String(px));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        write(window.scrollY, null);
        ticking = false;
      });
    };

    const onPointer = (e: PointerEvent) => {
      if (ticking) return;
      ticking = true;
      const px = (e.clientX / window.innerWidth - 0.5) * 24;
      requestAnimationFrame(() => {
        write(window.scrollY, px);
        ticking = false;
      });
    };

    const attach = () => {
      if (attached) return;
      window.addEventListener('scroll', onScroll, { passive: true });
      if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
      attached = true;
    };

    const detach = () => {
      if (!attached) return;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      attached = false;
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? attach() : detach()),
      { rootMargin: '120px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      detach();
    };
  }, []);

  return ref;
}
```

---

## 7. `src/components/landing/ridge-layer.tsx`

```tsx
import React from 'react';
import { cn } from '@/components/ui/button';
import { VIEW_BOX } from './layers/geometry';
import type { LayerSpec } from './layers/config';

export function RidgeLayer({
  spec,
  className,
  children,
}: {
  spec: LayerSpec;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 animate-rise"
      style={
        {
          '--rise': `${spec.rise}px`,
          animationDelay: `${spec.delay}ms`,
          animationDuration: `${spec.dur}ms`,
          zIndex: spec.z,
        } as React.CSSProperties
      }
    >
      <div
        className="ridge-parallax absolute inset-0"
        style={{ '--speed': spec.speed } as React.CSSProperties}
      >
        <svg
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMax slice"
          className={cn('absolute inset-0 h-full w-full', className)}
          aria-hidden="true"
          focusable="false"
        >
          {children}
        </svg>
      </div>
    </div>
  );
}
```

TypeScript strict mode rejects custom properties in a `CSSProperties` object literal; the
`as React.CSSProperties` cast is required and intentional. Do not widen the prop types instead.

---

## 8. `src/components/landing/ridge-scene.tsx`

```tsx
'use client';

import React from 'react';
import { RidgeLayer } from './ridge-layer';
import { SPEC } from './layers/config';
import { useParallax } from './use-parallax';
import {
  FAR_RIDGE,
  MID_RIDGE,
  FOOTHILLS,
  BUILDING,
  FENCE,
  FOREGROUND_FIELD,
  FOREGROUND_TREES,
  SUN,
} from './layers/geometry';

export function RidgeScene() {
  const ref = useParallax<HTMLDivElement>();

  return (
    <div ref={ref} className="ridge-scene absolute inset-0 overflow-hidden">
      {/* Sky — static, no layer wrapper */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))' }}
      />

      <RidgeLayer spec={SPEC.sun}>
        <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="var(--sun-fill)" />
      </RidgeLayer>

      <RidgeLayer spec={SPEC.far}>
        <path d={FAR_RIDGE} fill="var(--l-far)" className="ridge-crest" />
      </RidgeLayer>

      <RidgeLayer spec={SPEC.mid} className="hidden sm:block">
        <path d={MID_RIDGE} fill="var(--l-mid)" className="ridge-crest" />
      </RidgeLayer>

      <RidgeLayer spec={SPEC.hills}>
        <path d={FOOTHILLS} fill="var(--l-hills)" className="ridge-crest" />
      </RidgeLayer>

      <RidgeLayer spec={SPEC.building}>
        <g fill="var(--l-building)">
          {[BUILDING.gym, BUILDING.main, BUILDING.rightWing, BUILDING.stack].map((b) => (
            <rect key={`${b.x}-${b.y}`} x={b.x} y={b.y} width={b.w} height={b.h} />
          ))}
        </g>
        <g fill="var(--l-window)" opacity="0.9">
          {BUILDING.windows.map((w) => (
            <rect key={w.x} x={w.x} y={w.y} width={w.w} height={w.h} />
          ))}
          <rect
            x={BUILDING.entry.x}
            y={BUILDING.entry.y}
            width={BUILDING.entry.w}
            height={BUILDING.entry.h}
            opacity="0.55"
          />
        </g>
      </RidgeLayer>

      <RidgeLayer spec={SPEC.fence}>
        <path d={FENCE} fill="var(--l-fence)" fillRule="evenodd" />
      </RidgeLayer>

      <RidgeLayer spec={SPEC.fore}>
        <path d={FOREGROUND_FIELD} fill="var(--l-fore)" className="ridge-crest" />
        <g fill="var(--l-fore)">
          {FOREGROUND_TREES.map((t) => (
            <circle key={t.cx} cx={t.cx} cy={t.cy} r={t.r} />
          ))}
        </g>
      </RidgeLayer>
    </div>
  );
}
```

Note the explicit `w` → `width` / `h` → `height` mapping on every rect. `geometry.ts` stays a plain
data module with short keys; do not spread its objects onto `<rect>`, since `w` and `h` are not
valid SVG attributes and React will drop them silently — you get an invisible building with no error.

Mobile reduction is done with `className="hidden sm:block"` on the `mid` layer and by omitting the
`sun` layer's visual weight below `sm` — simpler and SSR-safe compared to a JS width check, which
would cause hydration mismatch. Use the Tailwind class approach; `MOBILE_OMIT` in `config.ts`
documents the intent and is asserted by test.

---

## 9. `src/components/landing/hero-copy.tsx` and `count-up.tsx`

`hero-copy.tsx` is a plain Server Component. Reuse the existing badge / headline / subhead / CTA
markup from the current `page.tsx` hero verbatim — same copy, same `Button` usage, same links to
`/login` and `/dashboard`. Wrap each block in `animate-rise` with `--rise: 28px` and delays of
620 / 700 / 780ms so the copy lands after the ridges.

`count-up.tsx` (`'use client'`):
- Props: `{ to: number; children: React.ReactNode }`.
- Render `children` (the server-formatted final value) as the initial output, so the correct number
  is in the HTML with JS disabled and there is no hydration mismatch.
- On mount, if not reduced-motion, use an `IntersectionObserver` to start a rAF ramp from 0 to `to`
  over 900ms with the same expo-out easing, then restore `children`.

---

## 10. Edits to existing files

### 10.1 `src/app/(public)/page.tsx`

1. Keep the imports and the `getDb()` block exactly as they are. Add:
   `import { RidgeScene } from '@/components/landing/ridge-scene';` and the sibling components.
2. The hero must be **full-bleed** — currently the whole page is wrapped in
   `<div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">`. Restructure to:

```tsx
return (
  <>
    <section className="relative isolate h-[92svh] min-h-[560px] max-h-[900px] overflow-hidden">
      <RidgeScene />
      <HeroCopy className="relative z-20" />
    </section>

    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* existing stats row, competitions, workshops, CTA — unchanged */}
    </div>
  </>
);
```

- `svh` not `vh`: prevents the hero resizing when mobile browser chrome hides.
- `isolate`: caps the scene's stacking context so layer z-indexes cannot collide with the sticky
  header at `z-40` in `layout.tsx`.
- Fixed height + `overflow-hidden` ⇒ **CLS 0**; the scene is absolutely positioned and never
  contributes to layout.

3. Move the stats grid out of the hero into the container below it, and wrap each numeric value in
   `<CountUp to={n}>…</CountUp>`.
4. Insert `<RidgeDivider />` between the major sections. It is `FAR_RIDGE` rendered at 40px tall,
   flipped, filled with the adjacent section's background color.
5. Restyle the workshop cards: replace `border-l-4 border-l-red-600` with a top-edge red hairline
   (`border-t-2 border-t-red-600`) to echo the crest lines.

### 10.2 `src/app/(public)/layout.tsx` — optional, do last

Make the header transparent while `scrollY < 80`, then transition to its current opaque style.
The file is `async` and calls `getCurrentUser()`; **do not add `'use client'` to it.** Extract only
the `<header>` shell into a small client component and pass the auth-dependent nodes through as
`children`. Skip this entirely if any part of it would move auth to the client.

---

## 11. `tests/landing.test.ts`

Vitest is `environment: 'node'` — pure module tests only, no JSX, no DOM.

```ts
import { describe, it, expect } from 'vitest';
import { LAYERS, MOBILE_OMIT, SPEC } from '@/components/landing/layers/config';
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
  it('has seven uniquely-identified layers', () => {
    expect(LAYERS).toHaveLength(7);
    expect(new Set(LAYERS.map((l) => l.id)).size).toBe(7);
  });

  it('rise, delay, dur, speed and z increase strictly with nearness', () => {
    const ordered = LAYERS.filter((l) => l.id !== 'sun');
    for (let i = 1; i < ordered.length; i++) {
      for (const k of ['rise', 'delay', 'dur', 'speed', 'z'] as const) {
        expect(ordered[i][k]).toBeGreaterThan(ordered[i - 1][k]);
      }
    }
  });

  it('parallax never exceeds half of scroll distance', () => {
    for (const l of LAYERS) expect(l.speed).toBeLessThan(0.5);
  });

  it('mobile omits exactly the sun and mid layers', () => {
    for (const id of MOBILE_OMIT) expect(SPEC[id]).toBeDefined();
    expect([...MOBILE_OMIT].sort()).toEqual(['mid', 'sun']);
  });
});
```

The slat count assertion is `81` given `x` from `-8` step `18` while `x < 1448`. **Compute it, do
not trust this number** — if `fencePath()` is written as specified the count follows; if you change
`W` or `GAP`, update the assertion to match.

---

## 12. Task order

Each task leaves the app building and shippable. Do not start a task before its predecessor's
acceptance criterion passes.

| # | Task | Done when |
|---|------|-----------|
| 1 | `geometry.ts` + `config.ts` + `tests/landing.test.ts` | `npm run test` passes; nothing rendered yet |
| 2 | `globals.css` additions + `tailwind.config.ts` keyframes | `npm run build` succeeds; no visual change yet |
| 3 | `ridge-layer.tsx`, `ridge-scene.tsx`, mount in hero **with `animate-rise` removed** | Static scene correct at 375 / 768 / 1440 / 2560px, light and dark |
| 4 | Re-enable `animate-rise` | Layers rise back-to-front on reload; no flash at final position |
| 5 | `use-parallax.ts` wired in | Fence slats visibly lead the ridges on scroll; DevTools Performance shows no layout or paint during scroll |
| 6 | `hero-copy.tsx`, z-order, scroll cue | Headline overlapped by building/fence yet fully legible at 375px |
| 7 | `count-up.tsx`, `ridge-divider.tsx`, card restyle | Stat numbers correct with JS disabled |
| 8 | A11y + reduced-motion + perf pass (§13) | All checks in §13 pass |
| 9 | *(optional)* transparent header | Auth still server-rendered; transition smooth |

Build the static scene before adding motion (task 3 before 4). Debugging a silhouette and a
choreography at the same time is the main way this goes wrong.

---

## 13. Verification

Run and report the output of all three:

```bash
npm run test && npx tsc --noEmit && npm run build
```

Manual checks — confirm each explicitly, do not assume:

1. **Widths** 375 / 768 / 1024 / 1440 / 2560. `slice` must never crop the building out of frame.
2. **Both themes**, including toggling the theme mid-scroll. Colors are CSS vars, so no re-render
   should be needed; if the scene flickers, a color was hardcoded.
3. **Dark mode crest lines** are visible and separate `hills` / `fence` / `fore`.
4. **`prefers-reduced-motion: reduce`** at the OS level — scene composes correctly, zero movement,
   and no scroll or pointer listener is attached (check DevTools → Elements → Event Listeners).
5. **JavaScript disabled** — full scene renders, copy readable, stats show real values.
6. **Keyboard** — hero CTAs reachable in order; no SVG enters the tab order.
7. **Lighthouse** — CLS exactly 0; no new render-blocking resources; TBT unchanged from baseline.
8. **DevTools → Rendering → Paint flashing** while scrolling: only compositor activity. Any green
   paint rectangle over a layer means a transform fell off the fast path — fix before finishing.

Report failures with the actual output. Do not mark a task done on the strength of the code
looking correct.

---

## 14. Known failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Parallax does nothing until ~2s after load | Entrance and parallax transforms on one element | §5 Rule 1 — nest them |
| Layers flash at final position, then jump down and animate | Missing `both` fill mode | §5 Rule 2 |
| Layers drift out of alignment as the window resizes | A `viewBox` or `preserveAspectRatio` differs between layers | §1 registration rule |
| Dark mode is an undifferentiated black mass | `--crest` is 0 or the stroke class was dropped | §4 |
| Hydration mismatch on the scene | A JS viewport-width check chose which layers to render | §8 — use Tailwind responsive classes |
| Scene overlaps or is overlapped by the sticky header | Missing `isolate` on the hero section | §10.1 |
| Layout shift on load | Hero height not fixed, or the scene is in flow | §10.1 — `h-[92svh]` + `absolute inset-0` |
| Janky scroll on low-end Android | Listener not throttled, or too many layers on mobile | §6 rAF + §8 responsive omission |

---

## 15. Latitude

Fixed, do not change without saying so: the seven-layer model, the z-order, the color roles (red =
building + crests only), the two-element transform split, and the constraints in §0.

Yours to tune: exact path coordinates (if you retrace the silhouette from the photo, keep the same
`viewBox` and the `L1440,640 L0,640 Z` terminator — everything else is isolated in `geometry.ts`),
the copy in `hero-copy.tsx`, and the below-fold card styling.

If a specified value turns out to be wrong in practice — a delay that feels sluggish, a coordinate
that crops badly at 375px — change it, and say in your final report what you changed and why.
