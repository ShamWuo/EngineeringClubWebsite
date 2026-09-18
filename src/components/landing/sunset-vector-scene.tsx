'use client';

import React from 'react';
import Image from 'next/image';

export function SunsetVectorScene() {
  return (
    <div className="sunset-scene pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* ── LAYER 0: Ambient Twilight Sky Glow ───────────────── */}
      <div className="sunset-living-sky absolute inset-0 z-0" />

      {/* ── LAYER 1: Deep Sky & Setting Sun Backdrop (Deepest Celestial Plane) ─── */}
      {/* Sinks slowest on scroll (0.65x lag factor), keeping the sun and sky deep in the distance */}
      <div
        className="vector-parallax-plane absolute inset-x-[-3%] -top-28 -bottom-12 z-1 origin-bottom"
        style={{
          transform:
            'scale(1.05) translate3d(calc(var(--px, 0) * 0.08px), calc(var(--py, 0) * 0.04px + var(--scroll-s, 0) * 0.65px), 0)',
          willChange: 'transform',
        }}
      >
        <Image
          src="/landing/flatirons_sky_clean.webp"
          alt="Sunset Sky Backdrop with Golden Setting Sun"
          fill
          priority
          quality={95}
          sizes="106vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* ── LAYER 2: Realistic Moving Sunset Clouds (3 Altitudes, Horizontal Drift Only) ─ */}
      <div
        className="vector-parallax-plane absolute inset-0 z-2 pointer-events-none overflow-hidden"
        style={{
          transform:
            'translate3d(calc(var(--px, 0) * 0.14px), calc(var(--py, 0) * 0.08px + var(--scroll-s, 0) * 0.50px), 0)',
          willChange: 'transform',
        }}
      >
        {/* Cloud Tier 1: High-altitude twilight wisps */}
        <div className="sunset-cloud-drift-1 absolute inset-x-[-15%] top-[7%] h-28 opacity-40 pointer-events-none">
          <svg viewBox="0 0 1800 140" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path
              d="M-50,60 C250,15 600,40 950,25 C1300,10 1600,45 1850,30 C1600,70 1200,55 850,65 C500,75 200,50 -50,60 Z"
              fill="rgba(244, 63, 94, 0.38)"
            />
            <path
              d="M100,95 C400,55 800,75 1150,60 C1500,45 1700,80 1900,70 C1650,110 1300,90 950,100 C600,110 300,85 100,95 Z"
              fill="rgba(251, 113, 133, 0.28)"
            />
          </svg>
        </div>

        {/* Cloud Tier 2: Mid-altitude warm peach/coral sunset cloud bank */}
        <div className="sunset-cloud-drift-2 absolute inset-x-[-12%] top-[20%] h-36 opacity-48 pointer-events-none">
          <svg viewBox="0 0 1800 160" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path
              d="M-80,85 C220,35 580,65 920,48 C1260,30 1560,60 1880,45 C1620,95 1220,80 860,90 C500,100 180,78 -80,85 Z"
              fill="rgba(249, 115, 22, 0.42)"
            />
            <path
              d="M80,120 C380,75 780,95 1120,82 C1460,70 1680,105 1920,92 C1650,135 1300,120 940,128 C580,138 280,115 80,120 Z"
              fill="rgba(251, 146, 60, 0.32)"
            />
          </svg>
        </div>

        {/* Cloud Tier 3: Low horizon golden cloud layer */}
        <div className="sunset-cloud-drift-3 absolute inset-x-[-10%] top-[34%] h-32 opacity-45 pointer-events-none">
          <svg viewBox="0 0 1800 140" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path
              d="M0,70 C320,38 680,55 1020,42 C1360,30 1640,55 1800,48 C1620,88 1260,78 920,82 C580,88 240,75 0,70 Z"
              fill="rgba(254, 240, 138, 0.45)"
            />
          </svg>
        </div>
      </div>

      {/* ── LAYER 3: Distant Purple Mountain Ridge (Back Mountain Plane) ──── */}
      {/* Slower mountain parallax (0.40x lag factor), creating depth between the Flatirons and distant ranges */}
      <div
        className="vector-parallax-plane absolute inset-x-[-3%] -bottom-10 -top-10 h-[calc(100%+80px)] z-3 origin-bottom"
        style={{
          transform:
            'scale(1.04) translate3d(calc(var(--px, 0) * 0.22px), calc(var(--py, 0) * 0.12px + var(--scroll-s, 0) * 0.40px), 0)',
          willChange: 'transform',
        }}
      >
        <Image
          src="/landing/flatirons_far_ridge.webp"
          alt="Distant Purple Mountain Foothills behind Flatirons"
          fill
          priority
          quality={95}
          sizes="106vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* ── LAYER 4: Boulder Flatirons & Ponderosa Pine Forest (Midground Mountain Plane) ── */}
      {/* Towering 1st through 5th Flatirons rock monoliths (0.22x lag factor) */}
      <div
        className="vector-parallax-plane absolute inset-x-[-3%] -bottom-10 -top-10 h-[calc(100%+80px)] z-4 origin-bottom"
        style={{
          transform:
            'scale(1.04) translate3d(calc(var(--px, 0) * 0.46px), calc(var(--py, 0) * 0.22px + var(--scroll-s, 0) * 0.22px), 0)',
          willChange: 'transform',
        }}
      >
        <Image
          src="/landing/flatirons_mid_mountains.webp"
          alt="Boulder Flatirons First through Fifth Formations and Pine Forest"
          fill
          priority
          quality={95}
          sizes="108vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* ── LAYER 5: Foreground Prairie Meadow & Split-Rail Fence (Near-Field Plane) ── */}
      {/* Moves closest to viewport speed (0.08x lag factor) so fence and meadow pass closest to viewer */}
      <div
        className="vector-parallax-plane absolute inset-x-[-3%] -bottom-10 -top-10 h-[calc(100%+80px)] z-5 origin-bottom"
        style={{
          transform:
            'scale(1.04) translate3d(calc(var(--px, 0) * 0.85px), calc(var(--py, 0) * 0.35px + var(--scroll-s, 0) * 0.08px), 0)',
          willChange: 'transform',
        }}
      >
        <Image
          src="/landing/flatirons_foreground_meadow.webp"
          alt="Golden Prairie Meadow, Split-Rail Fence, and Chautauqua Trail"
          fill
          priority
          quality={95}
          sizes="108vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* ── LAYER 6: Ground Contact Shadow & Clean Section Seam ───────────── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-24 sm:h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(9, 13, 22, 0.45) 35%, rgba(9, 13, 22, 0.92) 80%, rgba(9, 13, 22, 1) 100%)',
        }}
      />

      {/* Subtle Ambient Vignette & Analog Film Grain */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 140% 100% at 50% 30%, transparent 65%, rgba(9, 13, 22, 0.26) 100%)',
        }}
      />
      <div className="absolute inset-0 z-10 ridge-grain pointer-events-none opacity-15" />
    </div>
  );
}
