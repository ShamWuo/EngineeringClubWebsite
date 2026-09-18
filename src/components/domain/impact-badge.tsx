import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ImpactLevel } from '@/lib/db/types';

export const IMPACT_ORDER: Record<ImpactLevel, number> = {
  world: 0,
  national: 1,
  regional: 2,
  local: 3,
};

export const IMPACT_LABEL: Record<ImpactLevel, string> = {
  world: 'World Championship',
  national: 'National',
  regional: 'Regional',
  local: 'Local / In-House',
};

export const IMPACT_DESCRIPTION: Record<ImpactLevel, string> = {
  world: 'Global stage — international finals and world championship events.',
  national: 'Nationwide contest with major scholarship and recognition upside.',
  regional: 'State or multi-state circuit; a strong stepping stone to nationals.',
  local: 'Club-run or metro-area event. Great for first-year members.',
};

export function ImpactBadge({
  level,
  className,
}: {
  level: ImpactLevel | string | null | undefined;
  className?: string;
}) {
  if (!level) return null;

  switch (level) {
    case 'world':
      return (
        <Badge variant="purple" className={className}>
          🌍 World
        </Badge>
      );
    case 'national':
      return (
        <Badge variant="warning" className={className}>
          ⭐ National
        </Badge>
      );
    case 'regional':
      return (
        <Badge variant="info" className={className}>
          📍 Regional
        </Badge>
      );
    case 'local':
      return (
        <Badge variant="secondary" className={className}>
          🏠 Local
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {level}
        </Badge>
      );
  }
}
