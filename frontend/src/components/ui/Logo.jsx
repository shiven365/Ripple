import React from 'react';

export const Logo = ({ size = 'md', showRipple = true }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl'
  };

  const rippleSizes = {
    sm: 'w-8 h-8 border-[1.5px]',
    md: 'w-12 h-12 border-2',
    lg: 'w-20 h-20 border-2',
    xl: 'w-28 h-28 border-[3px]'
  };

  return (
    <div className="relative inline-flex items-center justify-center font-bold tracking-tight">
      {/* Ambient Looping Ripple Background */}
      {showRipple && (
        <>
          <div className={`absolute rounded-full border-brand-light/40 ${rippleSizes[size]} animate-[ripple-ping_3s_infinite_ease-out]`} />
          <div className={`absolute rounded-full border-brand-base/20 ${rippleSizes[size]} animate-[ripple-ping_3s_infinite_ease-out_1s]`} />
        </>
      )}
      <span className={`text-gradient relative z-10 ${sizes[size]}`}>
        Ripple
      </span>
    </div>
  );
};
