'use client';

import { useEffect, useRef } from 'react';

/**
 * Hero motion engine — writes CSS custom properties onto the returned element,
 * driven by one rAF loop with critically-damped lerp smoothing:
 *
 *   --scroll   raw page scrollY, px (unitless number)
 *   --scroll-s smoothed scrollY, px — eased, so layers trail the page like real mass
 *   --px       smoothed pointer X offset from center, ±24
 *   --py       smoothed pointer Y offset from center, ±18
 *   --copy-s   copy-layer scroll factor (opposes the page — headline sinks and
 *              blurs out like a near-field object)
 *   --copy-p   copy-layer pointer factor, damped 40% vs the scene
 *
 * All writes happen inside one rAF tick (cancel-and-reschedule is NOT used here —
 * the loop runs continuously while the hero is on screen, which is what makes the
 * lerp possible). Detaches via IntersectionObserver when the hero leaves the
 * viewport. Never runs when prefers-reduced-motion is set; consumers must leave
 * the neutral defaults (0) intact so the scene renders correctly without it.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let rafId = 0;
    let attached = false;

    // Current (smoothed) values.
    let sScroll = window.scrollY;
    let sPx = 0;
    let sPy = 0;
    // Target values written by listeners.
    let tPx = 0;
    let tPy = 0;

    // One-time sync so --scroll is correct before the first scroll event
    // (e.g. landing on a restored scroll position).
    el.style.setProperty('--scroll', String(window.scrollY));
    el.style.setProperty('--scroll-s', String(sScroll));

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const run = () => {
      const target = window.scrollY;
      sScroll = lerp(sScroll, target, 0.14);
      // Settle completely once the delta drops below a third of a pixel,
      // so the loop can idle instead of shimmering forever.
      if (Math.abs(target - sScroll) < 0.35) sScroll = target;

      sPx = lerp(sPx, tPx, 0.08);
      sPy = lerp(sPy, tPy, 0.08);

      el.style.setProperty('--scroll', String(target));
      el.style.setProperty('--scroll-s', String(sScroll));
      el.style.setProperty('--px', String(sPx));
      el.style.setProperty('--py', String(sPy));
      // Copy drifts against the scroll direction and with the pointer (damped).
      el.style.setProperty('--copy-s', String(-sScroll * 0.18 + sPx * 1.4));
      el.style.setProperty('--copy-p', String(sPy * 0.6));

      rafId = requestAnimationFrame(run);
    };

    const onScroll = () => {
      if (!attached) return;
      if (!rafId) rafId = requestAnimationFrame(run);
    };

    const onPointer = (e: PointerEvent) => {
      tPx = (e.clientX / window.innerWidth - 0.5) * 24;
      tPy = (e.clientY / window.innerHeight - 0.5) * 18;
      if (finePointer && attached && !rafId) rafId = requestAnimationFrame(run);
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
      rafId = requestAnimationFrame(run);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
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
