# Agent Brief v2 — "The Ridge" remediation

**Reader:** an implementing coding agent with write access to this repo.
**Supersedes:** `docs/landing-page-plan.md` (v1). That document specifies the build that shipped;
this one corrects it. Where the two disagree, **this file wins**.

**Status:** the scene is live at `src/app/(public)/page.tsx` and renders. Tests pass (25),
`tsc --noEmit` is clean, `npm run build` succeeds, the route is 3.02 kB. Review found ten defects,
four of them blocking. Two originate in the v1 spec, not in the implementation — they are marked
*(spec bug)* below, and the code faithfully implements what v1 wrongly asked for.

Goal of this work: fix all ten, without abandoning the design thesis. The layered-silhouette
concept, the palette, the geometry, and the entrance choreography are all correct and stay.

---

## 0. Constraints

Unchanged from v1 §0, restated because they still bind:

**MUST NOT** add any dependency; create `public/`; touch `src/lib/db/`, `src/actions/`,
`src/lib/supabase/`, `src/middleware.ts`; or make `page.tsx` / `layout.tsx` Client Components.

**MUST** keep `page.tsx` a Server Component; keep the existing data derivation byte-identical;
support both themes via CSS custom properties; support `prefers-reduced-motion`; render fully
without JavaScript.

New for v2:

- **No `requestAnimationFrame` boolean latch.** A `ticking = true` flag set before a rAF that never
  fires wedges the handler permanently. Every rAF-throttled handler in this codebase uses the
  cancel-and-reschedule form given in §4.4.
- **No client state may render a value that contradicts the server-rendered one.** If an animation
  cannot run, the true value must be what is on screen.

**Repo facts:** Tailwind **3.4** (not v4 — v4-only class names silently no-op), `cn()` is exported
from `src/components/ui/button.tsx`, vitest runs `environment: 'node'`, alias `@/*` → `./src/*`.

---

## 1. Defect register

| # | Severity | Defect | Evidence |
|---|---|---|---|
| D1 | **Blocking** | Hero CTAs are not clickable | `elementFromPoint` at both button centers returns `svg.absolute inset-0 h-full w-full`; every layer computes `pointer-events: auto` |
| D2 | **Blocking** | Building overlaps the primary CTA in the identical red | Button `x 429–662, y 495–535`; roof `stack` rect `x 509–536, y 510–568`; both `#dc2626` |
| D3 | **Blocking** | Scroll parallax runs backwards *(spec bug)* | Per 300px scroll: far ridge rises 294px, foreground only 198px. Distant layers lead, near layers lag |
| D4 | **Blocking** | Two stats render `0` instead of `3` | SSR emits `3, 3, $7,695, 0`; DOM shows `0, 0, $7,695, 0` after `CountUp` latches on its first frame |
| D5 | High | Mobile composition destroyed *(spec bug)* | At 375px, `slice` renders the 1440-wide viewBox at 1535px → **74% cropped**; no recognizable mountains |
| D6 | Low | `backdrop-blur-xs` is a Tailwind **v4** class | Computes to `backdrop-filter: none` in this v3 project |
| D7 | Low | `MOBILE_OMIT` is dead config | Lists `sun`; the scene only hides `mid` |
| D8 | Low | Hero overflows the viewport by 7px | `h-[92svh]` (662) + 65px sticky header vs 720 viewport |
| D9 | Low | `RidgeDivider` wastes 22% of its height | 640-unit viewBox squashed into 40px; the path's top 142 units are empty |
| D10 | — | `will-change` absent | **Intentional. Do not add it.** See §4.8 |

---

## 2. What is NOT wrong — do not "fix" these

- The seven-layer model, the z-order, and the geometry in `geometry.ts`. The silhouette reads well.
- The palette and the red crest lines. In dark mode the crests are the only thing separating
  `hills` / `fence` / `fore`, and they work.
- The entrance choreography (`rise`/`delay`/`dur`). Back-to-front stagger is correct.
- Overlapping the copy with near layers. **The overlap is the design thesis**, and D2 is not an
  argument against it — the problem is *which element* gets overlapped and *in what color*.
  §4.2 preserves the overlap and moves it off the interactive control.
- Server rendering, hydration, bundle size. All clean.

---

## 3. Root causes

Three of the ten defects share one root cause worth stating before the fixes.

**D2 and D5 both come from `preserveAspectRatio="…slice"` on a full-bleed container.** `slice`
couples the scene's scale to the container's aspect ratio, which nothing controls. At 1280×662
(aspect 1.93) that is a benign 14% side crop; at 375×682 (aspect 0.55) it is a 4× zoom. It also
makes the building's on-screen Y position a function of viewport aspect, which is why the roofline
lands on the CTA row at one size and not another. §4.1 removes the coupling by pinning the scene
band to the source aspect ratio, and D2 and D5 both fall out of that single change.

**D4 and the latch hazard come from rAF-dependent state with no fallback.** `CountUp` writes `0` on
its first frame and depends on later frames to climb; `useParallax` and `PublicHeaderShell` set
`ticking = true` before a rAF. In a background tab rAF is paused, so the number sticks at zero and
the handlers wedge forever — a real user who opens the page in a background tab and switches to it
hits this. §4.4 and §4.5 fix both.

---

## 4. Fixes

### 4.1 Scene band — fixes D5, and makes D2 tractable

Pin the scene to its source aspect ratio, bottom-anchored, and let the sky fill whatever is left
above it. `min()` handles both ends without a breakpoint or any JS:

```tsx
// ridge-scene.tsx — replace the outer structure
<div ref={ref} className="ridge-scene pointer-events-none absolute inset-0 overflow-hidden">
  {/* Sky fills the entire hero */}
  <div
    className="absolute inset-0 z-0"
    style={{ background: 'linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))' }}
  />

  {/* Scene band: 1440/640 = 2.25, so 100/2.25 = 44.44vw */}
  <div className="absolute inset-x-0 bottom-0 h-[min(100%,44.44vw)]">
    {/* all seven <RidgeLayer> elements move in here, unchanged */}
  </div>
</div>
```

Behavior at every width, with `slice` retained:

| Viewport | Band height | Result |
|---|---|---|
| 375 × 682 | 167px | **Zero crop** — the full panorama as a band above the fold's lower third, sky above |
| 1280 × 662 | 569px | Zero crop, 93px of sky above the ridge line |
| 2560 × 662 | 662px (clamped) | Container aspect 3.87 > 2.25, so `slice` crops the **top** — i.e. sky. Correct |

The band `<div>` is `position: absolute` with `z-index: auto`, so it creates no stacking context
and the layers' `z-5…z-30` still compete directly with `HeroCopy` at `z-20`. The overlap survives.

Then delete `MOBILE_OMIT` from `config.ts` (**D7**) and drop `className="hidden sm:block"` from the
`mid` layer. With no crop on mobile there is no reason to omit layers, and seven composited layers
is not a mobile perf problem.

### 4.2 Pointer events and the CTA collision — fixes D1, D2

**D1** is one class: `pointer-events-none` on `.ridge-scene`, already included in §4.1 above. It
inherits to all descendants; no per-layer change needed.

**D2** needs three changes together:

1. **Move the copy off the roofline.** Replace `HeroCopy`'s `justify-center … pb-24 sm:pb-32` with
   top alignment so the copy block's height, not the hero's centre, sets where it ends:

   ```
   justify-start pt-[6svh] pb-0
   ```

   With the §4.1 band, the building's highest point (the `stack` rect, viewBox `y=430`) now lands
   at a predictable fraction of the hero: `bandTop + 0.672 × bandHeight`. Desktop 1280×662 → 475px
   from the hero top; copy ends ≈393px. **82px clearance.**

2. **Shrink the copy on mobile,** or the same collision reappears at 375px, where the roofline is at
   627px and the untouched copy block ends at ~629px:
   - headline `text-3xl sm:text-4xl md:text-6xl lg:text-7xl` (was `text-4xl` at the base)
   - paragraph `line-clamp-3 sm:line-clamp-none`
   - copy stack `space-y-4 sm:space-y-6`

   That reclaims ~90px → copy ends ≈540px against a 627px roofline. **87px clearance.**

3. **De-conflict the red.** The building and the primary CTA are both `#dc2626`, so any future
   overlap is invisible until it eats a label. Darken the building one step — which also *improves*
   the depth ramp, since nearer should read darker:

   ```css
   .ridge-scene      { --l-building: #b91c1c; }  /* red-700, was #dc2626 */
   .dark .ridge-scene{ --l-building: #b91c1c; }
   ```

Also add a scrim behind the copy so text legibility never depends on what is behind it. On
`HeroCopy`'s root, `pointer-events-none` is already set; add:

```
before:absolute before:inset-0 before:-z-10 before:pointer-events-none
before:[background:radial-gradient(ellipse_at_center,var(--sky-top)_30%,transparent_72%)]
before:opacity-80
```

The ridges crossing the paragraph are gray, low-contrast, and legible — that overlap stays. The
scrim is insurance, not a replacement for (1) and (2).

### 4.3 Parallax direction — fixes D3

The v1 model had one multiplier that increased toward the viewer and was applied as a *positive*
translate, which makes near layers lag. Split it into two fields with opposite gradients:

- **`lag`** — scroll resistance. **Decreases** with nearness. Distant layers are nearly pinned.
- **`drift`** — pointer sensitivity. **Increases** with nearness. Near layers swing more.

Do **not** simply negate the translate. Negating makes layers rise faster than the page, and since
every path bottoms out at `y=640` with the scene `overflow-hidden`, the foreground would expose a
transparent gap beneath itself mid-scroll. Keeping the translate positive and inverting `lag` gives
correct depth ordering with no layer ever exceeding page speed.

```ts
// config.ts — replace `speed` with `lag` + `drift`
export interface LayerSpec {
  id: LayerId;
  rise: number;    // entrance travel, px
  delay: number;   // entrance delay, ms
  dur: number;     // entrance duration, ms
  lag: number;     // scroll resistance — HIGH = far/pinned
  drift: number;   // pointer sensitivity — HIGH = near
  z: number;
}

export const LAYERS: readonly LayerSpec[] = [
  { id: 'sun',      rise: 220, delay:   0, dur: 1800, lag: 0.50, drift: 0.010, z:  5 },
  { id: 'far',      rise:  24, delay:  60, dur: 1100, lag: 0.45, drift: 0.020, z: 10 },
  { id: 'mid',      rise:  44, delay: 150, dur: 1200, lag: 0.36, drift: 0.055, z: 12 },
  { id: 'hills',    rise:  70, delay: 240, dur: 1300, lag: 0.26, drift: 0.110, z: 15 },
  { id: 'building', rise: 100, delay: 360, dur: 1400, lag: 0.14, drift: 0.180, z: 25 },
  { id: 'fence',    rise: 130, delay: 460, dur: 1450, lag: 0.07, drift: 0.260, z: 28 },
  { id: 'fore',     rise: 170, delay: 540, dur: 1550, lag: 0.00, drift: 0.340, z: 30 },
] as const;
```

Resulting net upward motion for a 300px scroll — near leads, nothing exceeds page speed:

```
far 165 · mid 192 · hills 222 · building 258 · fence 279 · fore 300
```

```css
/* globals.css */
.ridge-parallax {
  transform: translate3d(
    calc(var(--px, 0) * var(--drift) * 1px),
    calc(var(--scroll, 0) * var(--lag) * 1px),
    0
  );
}
```

```tsx
// ridge-layer.tsx — inner div
style={{ '--lag': spec.lag, '--drift': spec.drift } as React.CSSProperties}
```

`sun` keeps the highest `lag` and the lowest `drift`: it is the most distant object and should be
the most pinned. It remains the documented exception to the `rise`/`dur` ordering.

### 4.4 rAF latch — fixes the wedge in `useParallax` and `PublicHeaderShell`

Replace the boolean latch with cancel-and-reschedule. If rAF is paused, the pending callback simply
fires when the page becomes visible again, and the handler self-heals:

```ts
let rafId = 0;

const run = () => {
  rafId = 0;
  el.style.setProperty('--scroll', String(window.scrollY));
};

const schedule = () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(run);
};
```

`onScroll` and `onPointer` both call `schedule()`; `onPointer` additionally records `--px` into a
module-local before scheduling. Cancel `rafId` in the effect cleanup alongside `detach()`.

Apply the identical shape to `PublicHeaderShell`.

### 4.5 `CountUp` — fixes D4

Three guarantees, in priority order: **the true value is always what is on screen** if the animation
cannot run; the animation never displays a value it did not reach honestly; and it self-terminates.

```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || document.visibilityState !== 'visible') return; // leave `children` rendered

  let rafId = 0;
  let timeoutId = 0;

  const start = () => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / 900);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(ease * to));
      if (p < 1) rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
    // Safety net: if rAF stalls (tab backgrounded mid-count), force the truth.
    timeoutId = window.setTimeout(() => setValue(to), 1400);
  };

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { io.disconnect(); start(); }
  }, { threshold: 0.1 });
  io.observe(el);

  return () => { io.disconnect(); cancelAnimationFrame(rafId); clearTimeout(timeoutId); };
}, [to]);
```

The `visibilityState` check is what actually fixes D4: in a background tab the component never
enters animating state at all and keeps rendering `children`, which is the server-rendered truth.
The `setTimeout` covers the case where the tab is backgrounded *after* the count starts —
`setTimeout` still fires in background tabs (throttled, but it fires) where rAF does not.

### 4.6 Tailwind v4 class — fixes D6

Replace both occurrences of `backdrop-blur-xs` in `hero-copy.tsx` with `backdrop-blur-sm`
(`blur(4px)`). Grep the whole `src/components/landing/` tree for other v4-only names before
finishing: `text-xs` sizes are fine, but `backdrop-blur-xs`, `shadow-xs`, `rounded-xs`, and
`blur-xs` are v4 spellings. Note `shadow-xs` **does** work here — `tailwind.config.ts` defines it
explicitly in `theme.extend.boxShadow` — so leave `shadow-xs` alone.

### 4.7 Hero height and divider — fixes D8, D9

**D8** — the header is `h-16` (64px) and `sticky`, so it consumes layout height above the hero:

```
h-[calc(100svh-4rem)] min-h-[560px] max-h-[900px]
```

**D9** — crop `RidgeDivider`'s viewBox to the ridge band so none of the 40px strip is dead space,
and the vertical squash drops from 16:1 to 5:1:

```tsx
<svg viewBox="0 140 1440 200" preserveAspectRatio="none" …>
```

`FAR_RIDGE`'s crest spans `y = 142…300`, so `140 … 340` frames it with a small margin.

### 4.8 `will-change` — D10, deliberate no-op

Do **not** add `will-change: transform` to `.ridge-parallax`. The transforms are already
compositor-only (verified: paint flashing shows no repaint on scroll), and a permanent `will-change`
on seven full-bleed layers pins seven backing surfaces in GPU memory for the life of the page. This
is a decision, not an oversight — v1 mentioned it in prose and was wrong to.

---

## 5. Test updates — `tests/landing.test.ts`

The existing depth-invariant test asserts `speed` strictly increasing. That field is gone. Replace
that assertion and delete the `MOBILE_OMIT` test:

```ts
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
```

The geometry tests are unchanged and still pass; do not touch them.

---

## 6. Verification

v1's verification was prose ("fence slats visibly lead the ridges") and **caught none of D1–D5**.
These are executable. Run each in the DevTools console on `/` and compare against the stated
expectation. A check that cannot be run is not a check.

**V1 — CTAs are clickable (D1).** Expect `isInsideLink: true` for both:

```js
[...document.querySelectorAll('section a[href="/login"], section a[href="/dashboard"]')].map(a => {
  const r = a.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
  return { href: a.getAttribute('href'), isInsideLink: !!hit?.closest('a') };
});
```

**V2 — nothing decorative overlaps the CTA (D2).** Expect `anyOverlap: false`:

```js
const btn = document.querySelector('section a[href="/login"]').getBoundingClientRect();
const bl = [...document.querySelector('.ridge-scene').querySelectorAll('rect')];
({ anyOverlap: bl.some(r => { const b = r.getBoundingClientRect();
   return b.left < btn.right && b.right > btn.left && b.top < btn.bottom && b.bottom > btn.top; }) });
```

**V3 — parallax ordering (D3).** Deterministic; does not depend on rAF. Expect a **strictly
increasing** series, `far` smallest and `fore` = 300:

```js
const s = document.querySelector('.ridge-scene');
const pick = z => [...s.querySelectorAll('[style*="z-index"], div')].find(c => getComputedStyle(c).zIndex === String(z));
const ty = el => new DOMMatrix(getComputedStyle(el.querySelector('.ridge-parallax')).transform).f;
s.style.setProperty('--scroll','300');
const out = { far: 300-ty(pick(10)), hills: 300-ty(pick(15)), building: 300-ty(pick(25)), fore: 300-ty(pick(30)) };
s.style.removeProperty('--scroll'); out;
// expect ≈ { far: 165, hills: 222, building: 258, fore: 300 }
```

**V4 — stats never contradict the server (D4).** Compare SSR to DOM; they must agree once settled,
and must agree *immediately* if the tab was never visible:

```bash
curl -s http://localhost:3000 | grep -oE 'font-black[^"]*"><span>[^<]*' | head -4
```
```js
[...document.querySelectorAll('.text-2xl.font-black')].map(e => e.textContent).slice(0,4);
```

**V5 — mobile crop (D5).** At 375px width, expect `croppedFraction` ≈ 0:

```js
const svg = document.querySelector('.ridge-scene svg');
const r = svg.getBoundingClientRect();
({ rendered: Math.round(r.width), container: Math.round(svg.parentElement.getBoundingClientRect().width),
   croppedFraction: +(1 - svg.parentElement.getBoundingClientRect().width / (640/r.height*1440*r.height/640)).toFixed(2) });
```
Simpler equivalent: screenshot at 375px and confirm both the left tree cluster **and** the right
wing of the building are visible simultaneously. In the current build they are not.

**V6 — Tailwind v4 classes (D6).** Expect `blur(4px)`, not `none`:

```js
const p = document.createElement('div'); p.className='backdrop-blur-sm'; document.body.append(p);
const v = getComputedStyle(p).backdropFilter; p.remove(); v;
```

**Also run, and report actual output:**

```bash
npm run test && npx tsc --noEmit && npm run build
```

Plus, manually: both themes including a mid-scroll toggle; `prefers-reduced-motion: reduce` at the
OS level with no listener attached; JS disabled; keyboard tab order reaching both CTAs; Lighthouse
CLS exactly 0; DevTools → Rendering → Paint flashing showing compositor-only scroll.

**Note on tooling:** an automated browser pane often runs with `document.visibilityState ===
"hidden"`, which pauses rAF. That is how D4 surfaced. When verifying V3, use the `--scroll` probe
above rather than a real scroll — it is deterministic and rAF-independent.

---

## 7. Task order

| # | Task | Verified by |
|---|------|-------------|
| 1 | §4.1 scene band + delete `MOBILE_OMIT` + unhide `mid` | V5; screenshot at 375 / 768 / 1440 / 2560 |
| 2 | §4.2 `pointer-events-none` | V1 |
| 3 | §4.2 copy repositioning, mobile type scale, `--l-building`, scrim | V2; read the hero at 375 and 1280 |
| 4 | §4.3 `lag` / `drift` + §5 test updates | V3; `npm run test` |
| 5 | §4.4 rAF latch in both hooks | Scroll with the tab backgrounded, then foreground it — header and parallax must catch up |
| 6 | §4.5 `CountUp` | V4, including a hard reload with the tab in the background |
| 7 | §4.6 / §4.7 `backdrop-blur-sm`, hero height, divider viewBox | V6; hero bottom edge flush with the fold |
| 8 | Full §6 sweep | All of it, with output reported |

Tasks 1–3 are ordered deliberately: the band changes where the building sits on screen, so
repositioning the copy before it would be tuning against geometry that is about to move.

---

## 8. Latitude

**Fixed:** the seven-layer model, z-order, `geometry.ts`, the palette roles (red = building +
crests only), the two-element transform split from v1 §5, the entrance choreography, and §0.

**Yours:** the exact `lag` / `drift` values (keep both gradients monotonic and `lag ≤ 0.6`), the
`6svh` top padding and mobile type scale in §4.2 (keep ≥60px clearance between the CTA row and the
roofline at 375px and 1280px), the scrim opacity, and the below-fold card styling.

If a specified value is wrong in practice, change it and say so in your final report. If a fix in
§4 does not resolve its defect, say that plainly rather than reporting the task done — every defect
here has an executable check in §6, so "it looks right" is not evidence.
