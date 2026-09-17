'use client';

import React, { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { rsvpWorkshop, cancelWorkshopRsvp } from '@/actions/workshops';
import { CheckCircle2, CalendarPlus, X } from 'lucide-react';

export function WorkshopRsvpButton({
  workshopId,
  isRsvped,
  isFull,
}: {
  workshopId: string;
  isRsvped: boolean;
  isFull: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRsvp = () => {
    startTransition(async () => {
      await rsvpWorkshop({ workshop_id: workshopId });
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelWorkshopRsvp({ workshop_id: workshopId });
    });
  };

  if (isRsvped) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleCancel}
        disabled={isPending}
        className="h-8 text-xs font-semibold gap-1 text-emerald-700 bg-emerald-50 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 dark:hover:bg-red-950/60 dark:hover:text-red-300 dark:hover:border-red-800"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>RSVP'd (Cancel)</span>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleRsvp}
      disabled={isPending || isFull}
      className="h-8 text-xs font-semibold gap-1 shadow-xs"
    >
      <CalendarPlus className="h-3.5 w-3.5" />
      <span>{isFull ? 'Capacity Full' : 'RSVP'}</span>
    </Button>
  );
}
