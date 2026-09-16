'use client';

import clsx from 'clsx';

export function RefreshButton({
  onClick,
  loading,
  label = 'Refresh',
  className,
}: {
  onClick: () => void;
  loading?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className={clsx(
        'inline-flex h-9 items-center gap-1.5 rounded border border-border-strong bg-surface-raised px-3 text-sm font-medium text-text-secondary',
        'transition-colors duration-150 ease-confident hover:border-text-tertiary hover:text-text-primary',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className={clsx('h-4 w-4', loading && 'animate-spin')}
        aria-hidden="true"
      >
        <path
          d="M16.5 10a6.5 6.5 0 1 1-1.94-4.64M16.5 3.5v3.5h-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
}