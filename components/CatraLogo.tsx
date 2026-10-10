import React from 'react';
import Image from 'next/image';

interface CatraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function CatraLogo({ className = '', size = 'md', priority = false }: CatraLogoProps) {
  // Dimensions based on original C-Yatra logo aspect ratio (~2.15:1)
  const dimensions = {
    sm: { width: 120, height: 56 },
    md: { width: 160, height: 74 },
    lg: { width: 220, height: 102 },
  }[size];

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <img
        src="/images/logo.png"
        alt="C-Yatra - Your Partner in Every Destination"
        width={dimensions.width}
        height={dimensions.height}
        className="h-auto w-auto max-h-full object-contain"
        style={{ aspectRatio: '215/100' }}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
