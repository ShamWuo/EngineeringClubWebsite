import React from 'react';
import Image from 'next/image';

interface ClubLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function ClubLogo({ className = 'h-8 w-8', size = 48, priority = false }: ClubLogoProps) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <Image
        src="/images/Icon.png"
        alt="Fairview Engineering Club Logo"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain drop-shadow-sm"
      />
    </div>
  );
}
