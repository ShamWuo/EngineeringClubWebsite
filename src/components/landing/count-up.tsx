'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CountUp({
  to,
  children,
  className,
  prefix = '',
  suffix = '',
}: {
  to: number;
  children: React.ReactNode;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [value, setValue] = useState<number | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
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

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [to]);

  return (
    <span ref={ref} className={className}>
      {value !== null ? `${prefix}${value.toLocaleString()}${suffix}` : children}
    </span>
  );
}
