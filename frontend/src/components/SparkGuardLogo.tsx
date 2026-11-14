import React from 'react';

interface SparkGuardLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

/**
 * Official SparkGuard Brand Logo Component
 * Uses the exact brand asset: the geometric cyan & dark "S" mark, "parkguard" lettering,
 * and the "— ASSESS. APPROVE. ACCELERATE —" tagline.
 */
export const SparkGuardLogo: React.FC<SparkGuardLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <img
        src="/sparkguard_logo_dark_theme.png"
        alt="SparkGuard — Assess. Approve. Accelerate"
        className={`${sizeClasses[size]} w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]`}
      />
    </div>
  );
};

export const SparkGuardMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <img
      src="/sparkguard_s_mark.png"
      alt="SparkGuard Logo Mark"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain inline-block drop-shadow-[0_0_12px_rgba(56,189,248,0.35)] ${className}`}
    />
  );
};

