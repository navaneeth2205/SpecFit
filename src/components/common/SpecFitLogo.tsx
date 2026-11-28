import React from 'react';

interface SpecFitLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Architectural Swiss precision mark for SpecFit.
 * Combines viewfinder crop brackets with a framed document layer.
 */
export const SpecFitLogo: React.FC<SpecFitLogoProps> = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  }[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      fill="none"
      className={`${sizeClasses} shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="specfit-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B5246" />
          <stop offset="100%" stopColor="#23322A" />
        </linearGradient>
      </defs>
      {/* Badge Container */}
      <rect width="36" height="36" rx="7" fill="url(#specfit-bg)" />
      <rect x="0.75" y="0.75" width="34.5" height="34.5" rx="6.25" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />

      {/* Outer Precision Crop / Viewfinder Brackets */}
      <path
        d="M7.5 12.5V9C7.5 8.17157 8.17157 7.5 9 7.5H12.5M23.5 7.5H27C27.8284 7.5 28.5 8.17157 28.5 9V12.5M28.5 23.5V27C28.5 27.8284 27.8284 28.5 27 28.5H23.5M12.5 28.5H9C8.17157 28.5 7.5 27.8284 7.5 27V23.5"
        stroke="#BFD9CA"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Folded Document / Framed Media Sheet */}
      <path
        d="M12.5 11.5H20L24 15.5V24.5C24 25.0523 23.5523 25.5 23 25.5H12.5C11.9477 25.5 11.5 25.0523 11.5 24.5V12.5C11.5 11.9477 11.9477 11.5 12.5 11.5Z"
        fill="#FFFFFF"
        fillOpacity="0.14"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Page Fold Corner */}
      <path
        d="M19.5 11.5V15.5C19.5 15.7761 19.7239 16 20 16H24"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Calibration Mark / Spec Crosshair */}
      <circle cx="17.75" cy="20.25" r="2.1" fill="#EAF2ED" />
    </svg>
  );
};
