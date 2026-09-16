'use client';

import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** 'md' (default): standard full-size form field. 'sm': compact h-9 trigger for inline/toolbar use (condition builder rows, table filters). Named `uiSize` (not `size`) to avoid colliding with the native `size` HTML attribute. */
  uiSize?: 'md' | 'sm';
  /** Visually hides the label (kept for screen readers via sr-only) — for spots where a neighboring label already describes the field. */
  hideLabel?: boolean;
  /** Overrides the input's width classes. Defaults to full width. */
  widthClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, type, className, uiSize = 'md', hideLabel = false, widthClassName, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';
    const isSm = uiSize === 'sm';

    return (
      <div className={clsx('flex flex-col', isSm ? 'gap-1' : 'gap-1.5')}>
        <label htmlFor={inputId} className={clsx(hideLabel ? 'sr-only' : clsx('font-medium text-text-secondary', isSm ? 'text-xs' : 'text-sm'))}>
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && revealed ? 'text' : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={clsx(
              'rounded border bg-surface-sunken text-text-primary placeholder:text-text-tertiary',
              isSm ? 'h-9 px-2.5 text-sm' : 'h-11 px-3.5 text-base',
              widthClassName ?? 'w-full',
              'transition-colors duration-150 ease-confident',
              'focus:outline-none focus:ring-2 focus:ring-accent-trust focus:ring-offset-2 focus:ring-offset-canvas',
              error ? 'border-risk-critical' : 'border-border-strong focus:border-accent-trust',
              isPassword && 'pr-16',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-tertiary hover:text-text-secondary"
              tabIndex={-1}
            >
              {revealed ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-sm text-pnl-negative">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-sm text-text-tertiary">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';