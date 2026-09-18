'use client';

import React from 'react';
import { useParallax } from './use-parallax';

/**
 * Renders the hero <section> and hosts the parallax CSS variables on it, so
 * every descendant — scene layers and copy alike — shares one motion source.
 * Server-rendered children (RidgeScene, HeroCopy) pass straight through.
 */
export function HeroParallax({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useParallax<HTMLElement>();

  return (
    <section
      ref={ref}
      className={className}
      style={
        {
          '--scroll': 0,
          '--scroll-s': 0,
          '--px': 0,
          '--py': 0,
          '--copy-s': 0,
          '--copy-p': 0,
        } as React.CSSProperties
      }
    >
      {children}
    </section>
  );
}
