'use client';

import React from 'react';
import { RidgeLayer } from './ridge-layer';
import { SPEC } from './layers/config';
import {
  FAR_RIDGE,
  MID_RIDGE,
  FOOTHILLS,
  BUILDING,
  FENCE,
  FOREGROUND_FIELD,
  SUN,
  CLOUDS,
  BIRDS,
  HILL_SHADE,
  BUILDING_ROOF_SHADES,
  BUILDING_SIDE_SHADES,
} from './layers/geometry';

/** Sun position as viewport percentages — shared by the halo, god rays, and light direction. */
const SUN_POS = { x: '63%', y: '38%' } as const;

export function RidgeScene() {
  return (
    <div className="ridge-scene pointer-events-none absolute inset-0 overflow-hidden">
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
          <filter id="ridge-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
      </svg>

      {/* Sky fills the entire hero; the horizon band lightens toward the ridge line */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--sky-top) 0%, var(--sky-mid) 42%, var(--sky-horizon) 78%, var(--sky-bottom) 100%)',
        }}
      />

      {/* Stars + moon — night sky only */}
      <div aria-hidden="true" className="ridge-stars absolute inset-0 z-0 hidden dark:block" />
      <div
        aria-hidden="true"
        className="absolute z-0 hidden dark:block"
        style={{
          left: '76%',
          top: '11%',
          width: 54,
          height: 54,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle at 36% 34%, #f8fafc 0%, #e2e8f0 58%, #cbd5e1 100%)',
          boxShadow:
            '0 0 44px 10px rgb(226 232 240 / 0.14), 0 0 120px 30px rgb(148 163 184 / 0.10)',
        }}
      />

      {/* Crepuscular god rays sweeping slowly from the sun (daylight only) */}
      <div
        aria-hidden="true"
        className="ridge-rays absolute inset-0 z-0 hidden dark:hidden lg:block"
      />

      {/* Warm halo around the sun position (behind ridges) */}
      <div
        className="ridge-sun-pulse absolute z-0 pointer-events-none"
        style={{
          left: SUN_POS.x,
          top: SUN_POS.y,
          width: '52vw',
          height: '52vw',
          maxWidth: 820,
          maxHeight: 820,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, var(--sun-halo-a) 0%, var(--sun-halo-b) 38%, transparent 68%)',
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
        </RidgeLayer>

        <RidgeLayer spec={SPEC.mid}>
          <path d={MID_RIDGE} fill="url(#ridge-mid)" className="ridge-crest" />
          {/* Birds — a kettle riding the thermal above the Flatirons */}
          {BIRDS.map((b, i) => (
            <path
              key={i}
              d={`M${b.x - 9 * b.s},${b.y} Q${b.x - 4.5 * b.s},${b.y - 6 * b.s} ${b.x},${b.y} Q${
                b.x + 4.5 * b.s
              },${b.y - 6 * b.s} ${b.x + 9 * b.s},${b.y}`}
              fill="none"
              stroke="var(--bird-stroke)"
              strokeWidth={1.6 * b.s}
              strokeLinecap="round"
              opacity={b.f ? 0.85 : 0.6}
              className="ridge-bird"
              style={{ animationDelay: `${i * 1.7}s` }}
            />
          ))}
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
          {/* Interior glow bloom — night only, behind the crisp window rects */}
          <g
            className="hidden dark:inline"
            filter="url(#ridge-glow)"
            fill="var(--l-window)"
            opacity="0.4"
          >
            {BUILDING.windows.map((w, i) => (
              <rect
                key={`g-${w.x}`}
                x={w.x - 2}
                y={w.y - 2}
                width={w.w + 4}
                height={w.h + 4}
                className="ridge-window-glow"
                style={{ animationDelay: `${i * 2.3}s` }}
              />
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
        </RidgeLayer>

        {/* Horizon haze — sits on top of mid, under the building layer, brightens the seam */}
        <div
          className="absolute inset-x-0 z-20 pointer-events-none"
          style={{
            top: '58%',
            height: '26%',
            background:
              'linear-gradient(to bottom, transparent, var(--haze) 45%, var(--haze) 62%, transparent)',
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
        style={{
          background:
            'radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, var(--vignette) 100%)',
        }}
      />
      <div className="absolute inset-0 z-30 ridge-grain pointer-events-none" />
    </div>
  );
}
