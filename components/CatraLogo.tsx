import React from 'react';

interface CatraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export function CatraLogo({ className = '', size = 'md', priority = false }: CatraLogoProps) {
  // Responsive sizing tailored for mobile header fidelity and clean proportions
  // Header (sm): 32px on mobile (h-8), 40px on tablet (sm:h-10), 44px on desktop (md:h-11)
  const sizeClasses = {
    sm: 'h-8 sm:h-10 md:h-11 max-h-11',
    md: 'h-11 sm:h-13 md:h-14',
    lg: 'h-14 sm:h-16 md:h-20',
  }[size];

  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <img
        src="/images/logo.png"
        alt="C-Yatra - Your Perfect Holiday Destination"
        className={`w-auto object-contain transition-all duration-150 ${sizeClasses}`}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}
