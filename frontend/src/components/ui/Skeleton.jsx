import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("skeleton-shimmer rounded-xl", className)}
      {...props}
    />
  );
};
