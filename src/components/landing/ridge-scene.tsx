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
  CLOUDS,
  BIRDS,
  HILL_SHADE,
  BUILDING_ROOF_SHADES,
  BUILDING_SIDE_SHADES,
} from './layers/geometry';

export function RidgeScene() {
  const ref = useParallax<HTMLDivElement>();

  return (
    <div ref={ref} className="ridge-scene pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gradients & atmosphere definitions */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="ridge-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sky-top)" />
            <stop offset="62%" stopColor="var(--sky-mid)" />
            <stop offset="100%" stopColor="var(--sky-bottom)" />
          </linearGradient>
          <linearGradient id="ridge-sun-halo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--sun-halo-a)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--sun-halo-b)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="ridge-sun-disc">
            <stop offset="0%" stopColor="var(--sun-core)" />
            <stop offset="70%" stopColor="var(--sun-core)" />
            <stop offset="100%" stopColor="var(--sun-core)" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="ridge-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--l-far-top)" />
            <stop offset="100%" stopColor="var(--l-far-bot)" />
          </linearGradient>
          <linearGradient id="ridge-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--l-mid-top)" />
            <stop offset="100%" stopColor="var(--l-mid-bot)" />
          </linearGradient>
          <linearGradient id="ridge-hills" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--l-hills-top)" />
            <stop offset="100%" stopColor="var(--l-hills-bot)" />
          </linearGradient>
          <linearGradient id="ridge-fore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--l-fore-top)" />
            <stop offset="100%" stopColor="var(--l-fore-bot)" />
          </linearGradient>
          <linearGradient id="ridge-building" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--l-building-top)" />
            <stop offset="100%" stopColor="var(--l-building-bot)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sky fills the entire hero */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, var(--sky-top), var(--sky-mid) 62%, var(--sky-bottom))' }}
      />

      {/* Warm halo around the sun position (behind ridges) */}
      <div
        className="absolute z-0 pointer-events-none"
        style={{
          left: '63%',
          top: '38%',
          width: '52vw',
          height: '52vw',
          maxWidth: 820,
          maxHeight: 820,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--sun-halo-a) 0%, var(--sun-halo-b) 38%, transparent 68%)',
        }}
      />

      {/* Technical grid overlay & ambient focal glow */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-50 dark:opacity-40 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_10%,rgba(220,38,38,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_10%,rgba(220,38,38,0.15),transparent_70%)] pointer-events-none" />

      {/* Scene band: 1440/640 = 2.25, so 100/2.25 = 44.44vw */}
      <div className="absolute inset-x-0 bottom-0 h-[min(100%,44.44vw)] opacity-90 dark:opacity-95">
        <RidgeLayer spec={SPEC.sun}>
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="url(#ridge-sun-disc)" />
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r * 1.45} fill="var(--sun-rim)" opacity="0.5" />
          <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r * 1.9} fill="var(--sun-rim)" opacity="0.22" />
        </RidgeLayer>

        <RidgeLayer spec={SPEC.far}>
          <path d={FAR_RIDGE} fill="url(#ridge-far)" className="ridge-crest" />
        </RidgeLayer>

        {/* Clouds — behind the mid ridge, in front of the far ridge */}
        <RidgeLayer spec={SPEC.clouds}>
          {CLOUDS.map((c, i) => (
            <ellipse
              key={i}
              cx={c.cx}
              cy={c.cy}
              rx={c.rx}
              ry={c.ry}
              fill="var(--cloud-fill)"
              opacity={c.opacity}
              className="ridge-cloud"
              style={{ animationDelay: `${(i * 37) % 90}s` }}
            />
          ))}
          {BIRDS.map((b, i) => (
            <path
              key={`bird-${i}`}
              d={`M${b.x - 10 * b.s},${b.y} q${10 * b.s},${-7 * b.s} ${10 * b.s},0 q${10 * b.s},${7 * b.s} ${10 * b.s},0`}
              stroke="var(--bird-stroke)"
              strokeWidth={2.2 * b.s}
              fill="none"
              opacity={b.f ? 0.85 : 0.6}
            />
          ))}
        </RidgeLayer>

        <RidgeLayer spec={SPEC.mid}>
          <path d={MID_RIDGE} fill="url(#ridge-mid)" className="ridge-crest" />
        </RidgeLayer>

        <RidgeLayer spec={SPEC.hills}>
          <path d={FOOTHILLS} fill="url(#ridge-hills)" className="ridge-crest" />
          {HILL_SHADE.map((s, i) => (
            <ellipse
              key={i}
              cx={s.x + s.w / 2}
              cy={452}
              rx={s.w / 2}
              ry={30}
              fill="var(--l-hills-shade)"
              opacity="0.35"
            />
          ))}
        </RidgeLayer>

        <RidgeLayer spec={SPEC.building}>
          <g fill="url(#ridge-building)">
            {[BUILDING.gym, BUILDING.main, BUILDING.rightWing, BUILDING.stack].map((b) => (
              <rect key={`${b.x}-${b.y}`} x={b.x} y={b.y} width={b.w} height={b.h} />
            ))}
          </g>
          <g fill="var(--l-building-shade)">
            {BUILDING_ROOF_SHADES.map((r, i) => (
              <rect key={`r-${i}`} x={r.x} y={r.y} width={r.w} height={r.h} />
            ))}
            {BUILDING_SIDE_SHADES.map((s, i) => (
              <rect key={`s-${i}`} x={s.x} y={s.y} width={s.w} height={s.h} opacity="0.5" />
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
          <path d={FOREGROUND_FIELD} fill="url(#ridge-fore)" className="ridge-crest" />
          <g fill="var(--l-fore-top)">
            {FOREGROUND_TREES.map((t) => (
              <circle key={t.cx} cx={t.cx} cy={t.cy} r={t.r} />
            ))}
          </g>
        </RidgeLayer>

        {/* Horizon haze — sits on top of mid, under the building layer, brightens the seam */}
        <div
          className="absolute inset-x-0 z-20 pointer-events-none"
          style={{
            top: '58%',
            height: '26%',
            background: 'linear-gradient(to bottom, transparent, var(--haze) 45%, var(--haze) 62%, transparent)',
          }}
        />
      </div>

      {/* Ground contact shadow — darkens the base of the scene into the next section */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 h-16 sm:h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--ground-shadow))' }}
      />

      {/* Vignette + film grain */}
      <div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, var(--vignette) 100%)' }}
      />
      <div className="absolute inset-0 z-30 ridge-grain pointer-events-none" />
    </div>
  );
}
