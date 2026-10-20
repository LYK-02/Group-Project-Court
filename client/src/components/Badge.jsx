import React from 'react';

/**
 * Reusable neo-brutalist status/category badge with border and high-contrast text.
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  pill = false,
  className = '',
}) {
  const variants = {
    neutral: 'bg-white text-ink border-2 border-ink',
    yellow: 'bg-vivid-yellow text-ink border-2 border-ink',
    red: 'bg-hot-red text-ink border-2 border-ink',
    violet: 'bg-soft-violet text-ink border-2 border-ink',
    ink: 'bg-ink text-white border-2 border-ink',
    // Semantic mappings
    open: 'bg-vivid-yellow text-ink border-2 border-ink font-bold',
    closed: 'bg-ink text-white border-2 border-ink font-bold',
    draft: 'bg-neutral-200 text-ink border-2 border-ink',
    todo: 'bg-neutral-100 text-ink border-2 border-ink',
    in_progress: 'bg-vivid-yellow text-ink border-2 border-ink',
    done: 'bg-[#86efac] text-ink border-2 border-ink',
    fair: 'bg-[#86efac] text-ink border-2 border-ink',
    needs_review: 'bg-vivid-yellow text-ink border-2 border-ink',
    unfair: 'bg-hot-red text-ink border-2 border-ink',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1 font-bold uppercase tracking-wider',
    lg: 'text-sm px-4 py-1.5 font-bold uppercase tracking-wider',
  };

  const shape = pill ? 'rounded-full' : 'rounded-none';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${shape} ${className}`}
    >
      {children}
    </span>
  );
}
