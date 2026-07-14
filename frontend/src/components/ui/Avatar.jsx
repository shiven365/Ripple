import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Avatar = ({ src, alt, initials, size = 'md', className, hasStory = false, isOnline = false }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const innerAvatar = (
    <div className={twMerge(
      clsx(
        "relative rounded-full flex items-center justify-center shrink-0",
        sizes[size]
      ),
      className
    )}>
      <div className="w-full h-full rounded-full overflow-hidden border border-border-subtle bg-brand-start/10 text-brand-end font-bold flex items-center justify-center">
        {src ? (
          <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
        ) : (
          <span>{initials?.substring(0, 2).toUpperCase() || '?'}</span>
        )}
      </div>
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-[28%] h-[28%] bg-green-500 rounded-full border-2 border-bg-surface z-10 translate-x-[5%] translate-y-[5%] shadow-sm"></div>
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div className={clsx("rounded-full p-[2px] bg-gradient-to-tr from-brand-light via-brand-base to-brand-dark cursor-pointer")}>
        {innerAvatar}
      </div>
    );
  }

  return innerAvatar;
};
