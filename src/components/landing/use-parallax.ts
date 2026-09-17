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
    let rafId = 0;
    let attached = false;
    let lastPx: number | null = null;

    const run = () => {
      rafId = 0;
      el.style.setProperty('--scroll', String(window.scrollY));
      if (lastPx !== null) {
        el.style.setProperty('--px', String(lastPx));
      }
    };

    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(run);
    };

    const onScroll = () => {
      schedule();
    };

    const onPointer = (e: PointerEvent) => {
      lastPx = (e.clientX / window.innerWidth - 0.5) * 24;
      schedule();
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
      cancelAnimationFrame(rafId);
      io.disconnect();
      detach();
    };
  }, []);

  return ref;
}
