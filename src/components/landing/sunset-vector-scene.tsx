'use client';

import React from 'react';
import Image from 'next/image';
import { VIEW_BOX, SUNSET_BIRDS } from './sunset-geometry';

export function SunsetVectorScene() {
  return (
    <div className="sunset-scene pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* ── LAYER 0: Animated Sunset Sky Gradient Fallback ─────────────────── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, #120e28 0%, #3b113b 32%, #7e163b 58%, #c2410c 78%, #f59e0b 100%)',
        }}
      />

      {/* ── LAYER 1: Parallax Sky Plane (Deep Celestial Plane) ───────────── */}
      <div
        className="vector-parallax-plane absolute inset-0 z-1 origin-bottom"
        style={
          {
            '--drift': 0.12,
            '--vdrift': 0.08,
            '--lag': 0.04,
            transform:
              'scale(1.04) translate3d(calc(var(--px, 0) * var(--drift) * 1px), calc(var(--py, 0) * var(--vdrift) * 1px + var(--scroll-s, 0) * var(--lag) * 1px), 0)',
            willChange: 'transform',
          } as React.CSSProperties
        }
      >
        <Image
          src="/landing/flatirons_sky.webp"
          alt="Sunset Sky Backdrop"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-bottom"
        />

        {/* Animated Solar Horizon Corona Bloom */}
        <div
          aria-hidden="true"
          className="ridge-sun-pulse absolute pointer-events-none"
          style={{
            left: '50%',
            bottom: '22%',
            width: '64vw',
            height: '42vw',
            maxWidth: 820,
            maxHeight: 540,
            transform: 'translate(-50%, 50%)',
            background:
              'radial-gradient(ellipse at center, rgba(254, 240, 138, 0.55) 0%, rgba(251, 146, 60, 0.32) 36%, rgba(225, 29, 72, 0.15) 64%, transparent 80%)',
          }}
        />

        {/* Dynamic Crepuscular God Rays Breathing from the Setting Sun */}
        <div
          aria-hidden="true"
          className="sunset-god-rays absolute inset-0 pointer-events-none opacity-45 mix-blend-screen"
        />

        {/* Animated Drifting Sunset Cirrus Cloud Wisps */}
        <div className="absolute inset-x-0 top-[15%] h-36 opacity-35 pointer-events-none ridge-cloud">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-full" aria-hidden="true">
            <path
              d="M-80,90 Q200,40 520,75 T1100,55 T1580,70 Q1400,120 1000,105 T400,115 Z"
              fill="rgba(251, 146, 60, 0.4)"
            />
            <path
              d="M100,130 Q450,90 850,115 T1500,105 Q1250,165 780,145 T-20,150 Z"
              fill="rgba(244, 63, 94, 0.3)"
            />
          </svg>
        </div>
      </div>

      {/* ── LAYER 2: Parallax Mountain Ridge Plane (Boulder Flatirons) ───── */}
      {/* Firmly anchored at bottom=0, translating with midground parallax */}
      <div
        className="vector-parallax-plane absolute inset-0 z-5 origin-bottom"
        style={
          {
            '--drift': 0.38,
            '--vdrift': 0.22,
            '--lag': 0,
            transform:
              'scale(1.03) translate3d(calc(var(--px, 0) * var(--drift) * 1px), calc(var(--py, 0) * var(--vdrift) * 1px + var(--scroll-s, 0) * var(--lag) * 1px), 0)',
            willChange: 'transform',
          } as React.CSSProperties
        }
      >
        <Image
          src="/landing/flatirons_mountains.webp"
          alt="Boulder Flatirons & Longs Peak 3D Vector Ridges"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-bottom"
        />
      </div>

      {/* ── LAYER 3: Soaring Birds Vector Plane (Upper Twilight Horizon) ──── */}
      <div
        className="vector-parallax-plane absolute inset-0 z-6 pointer-events-none"
        style={
          {
            '--drift': 0.65,
            '--vdrift': 0.35,
            '--lag': 0.22,
            transform:
              'translate3d(calc(var(--px, 0) * var(--drift) * 1px), calc(var(--py, 0) * var(--vdrift) * 1px + var(--scroll-s, 0) * var(--lag) * 1px), 0)',
          } as React.CSSProperties
        }
      >
        <svg
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {SUNSET_BIRDS.map((b, i) => (
            <path
              key={`b-${i}`}
              d={`M${b.x - 10 * b.s},${b.y} Q${b.x - 5 * b.s},${b.y - 7 * b.s} ${b.x},${b.y} Q${b.x + 5 * b.s},${b.y - 7 * b.s} ${b.x + 10 * b.s},${b.y}`}
              fill="none"
              stroke="#2e1026"
              strokeWidth={1.8 * b.s}
              strokeLinecap="round"
              opacity={0.85}
              className="ridge-bird"
              style={{ animationDelay: `${i * 2.1}s` }}
            />
          ))}
        </svg>
      </div>

      {/* ── LAYER 4: Foreground Prairie Mist & Depth Accent ──────────────── */}
      <div
        className="vector-parallax-plane absolute inset-x-0 bottom-0 z-8 pointer-events-none h-32 sm:h-44"
        style={
          {
            '--drift': 0.85,
            '--vdrift': 0.42,
            '--lag': 0.32,
            transform:
              'translate3d(calc(var(--px, 0) * var(--drift) * 1px), calc(var(--py, 0) * var(--vdrift) * 1px + var(--scroll-s, 0) * var(--lag) * 1px), 0)',
            background:
              'linear-gradient(to top, rgba(9, 13, 22, 0.7) 0%, rgba(9, 13, 22, 0.25) 50%, transparent 100%)',
          } as React.CSSProperties
        }
      />

      {/* ── LAYER 5: Ground Contact Shadow — Silky Transition to Next Section ─ */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 h-28 sm:h-36 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(9, 13, 22, 0.3) 30%, rgba(9, 13, 22, 0.85) 75%, rgba(9, 13, 22, 1) 100%)',
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
      <div className="absolute inset-0 z-10 ridge-grain pointer-events-none opacity-20" />
    </div>
  );
}
