import React from 'react';
import { cn } from '@/components/ui/button';
import { VIEW_BOX } from './layers/geometry';
import type { LayerSpec } from './layers/config';

export function RidgeLayer({
  spec,
  className,
  children,
}: {
  spec: LayerSpec;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 animate-rise"
      style={
        {
          '--rise': `${spec.rise}px`,
          animationDelay: `${spec.delay}ms`,
          animationDuration: `${spec.dur}ms`,
          zIndex: spec.z,
        } as React.CSSProperties
      }
    >
      <div
        className="ridge-parallax absolute inset-0"
        style={
          {
            '--lag': spec.lag,
            '--drift': spec.drift,
            ...(spec.blur > 0 || spec.sat > 0
              ? {
                  filter: `blur(${spec.blur}px) saturate(${100 - spec.sat}%)`,
                }
              : {}),
          } as React.CSSProperties
        }
      >
        <svg
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMax slice"
          className={cn('absolute inset-0 h-full w-full', className)}
          aria-hidden="true"
          focusable="false"
        >
          {children}
        </svg>
      </div>
    </div>
  );
}
