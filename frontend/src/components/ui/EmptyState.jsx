import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const EmptyState = ({ icon: Icon, title, description, className }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-bg-surface rounded-2xl border border-border-subtle", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center mb-4 text-text-secondary">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-[14px] text-text-secondary">{description}</p>}
    </div>
  );
};
