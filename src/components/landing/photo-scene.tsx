'use client';

import React from 'react';
import Image from 'next/image';

interface PhotoLayerSpec {
  id: string;
  src: string;
  alt: string;
  lag: number;      // Scroll resistance factor (near field moves faster)
  drift: number;    // Mouse X tilt factor
  vdrift: number;   // Mouse Y tilt factor
  rise: number;     // Entrance animation rise (px)
  delay: number;    // Entrance animation delay (ms)
  duration: number; // Entrance animation duration (ms)
  zIndex: number;
}

const PHOTO_LAYERS: PhotoLayerSpec[] = [
  {
    id: 'sky',
    src: '/landing/sky.webp',
    alt: 'Sunset sky and clouds over the Front Range',
    lag: 0.04,
    drift: 0.02,
    vdrift: 0.01,
    rise: 40,
    delay: 0,
    duration: 1600,
    zIndex: 1,
  },
  {
    id: 'longs-peak',
    src: '/landing/longs_peak.webp',
    alt: 'Snow-capped Longs Peak and the Continental Divide',
    lag: 0.16,
    drift: 0.05,
    vdrift: 0.03,
    rise: 60,
    delay: 120,
    duration: 1300,
    zIndex: 2,
  },
  {
    id: 'flatirons',
    src: '/landing/flatirons.webp',
    alt: 'The Boulder Flatirons rock formations and Green Mountain ridge',
    lag: 0.32,
    drift: 0.11,
    vdrift: 0.07,
    rise: 90,
    delay: 240,
    duration: 1400,
    zIndex: 3,
  },
  {
    id: 'foreground',
    src: '/landing/foreground.webp',
    alt: 'Marshall Mesa foothills and South Boulder plains meadow',
    lag: 0.52,
    drift: 0.22,
    vdrift: 0.13,
    rise: 130,
    delay: 380,
    duration: 1500,
    zIndex: 4,
  },
];

export function PhotoScene() {
  return (
    <div className="photo-scene pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Twilight atmosphere base fill */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--sky-top) 0%, var(--sky-mid) 35%, var(--sky-horizon) 70%, var(--sky-bottom) 100%)',
        }}
      />

      {/* Dark mode stars & celestial twilight in the upper sky */}
      <div aria-hidden="true" className="ridge-stars absolute inset-0 z-0 hidden dark:block opacity-60" />

      {/* Warm sunset horizon glow behind mountain crests */}
      <div
        aria-hidden="true"
        className="ridge-sun-pulse absolute z-0 pointer-events-none"
        style={{
          left: '58%',
          top: '42%',
          width: '60vw',
          height: '45vw',
          maxWidth: 900,
          maxHeight: 700,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse at center, rgba(251, 146, 60, 0.22) 0%, rgba(244, 63, 94, 0.12) 35%, transparent 70%)',
        }}
      />

      {/* Technical engineering grid overlay */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-25 dark:opacity-20 pointer-events-none" />

      {/* Subtle central ambient focal glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_15%,rgba(220,38,38,0.07),transparent_70%)] dark:bg-[radial-gradient(ellipse_75%_45%_at_50%_15%,rgba(220,38,38,0.12),transparent_70%)] pointer-events-none" />

      {/* Multi-plane Photographic Parallax Layers */}
      <div className="absolute inset-0 z-10">
        {PHOTO_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className="absolute inset-0 animate-rise"
            style={
              {
                '--rise': `${layer.rise}px`,
                animationDelay: `${layer.delay}ms`,
                animationDuration: `${layer.duration}ms`,
                zIndex: layer.zIndex,
              } as React.CSSProperties
            }
          >
            <div
              className="photo-parallax-plane absolute inset-[-4%] w-[108%] h-[108%]"
              style={
                {
                  '--lag': layer.lag,
                  '--drift': layer.drift,
                  '--vdrift': layer.vdrift,
                } as React.CSSProperties
              }
            >
              <Image
                src={layer.src}
                alt={layer.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1920px"
                className="object-cover object-bottom pointer-events-none select-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Atmospheric depth haze between Flatirons and foreground */}
      <div
        className="absolute inset-x-0 bottom-0 z-15 pointer-events-none h-48 sm:h-64"
        style={{
          background:
            'linear-gradient(to top, rgba(15, 23, 42, 0.15), rgba(245, 158, 11, 0.06) 40%, transparent 100%)',
        }}
      />

      {/* Dark mode moody grade overlay */}
      <div
        className="absolute inset-0 z-15 pointer-events-none hidden dark:block"
        style={{
          background:
            'linear-gradient(to bottom, rgba(9, 9, 11, 0.25) 0%, transparent 40%, rgba(9, 9, 11, 0.4) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Ground contact shadow — smoothly bridges the base of the photograph into the stats panel */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 h-24 sm:h-36 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.65) 100%)',
        }}
      />

      {/* Subtle vignette and film grain for photographic realism */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 130% 95% at 50% 40%, transparent 52%, var(--vignette) 100%)',
        }}
      />
      <div className="absolute inset-0 z-20 ridge-grain pointer-events-none" />
    </div>
  );
}
