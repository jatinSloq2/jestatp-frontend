'use client';

import { InputHTMLAttributes, forwardRef, useId, useState } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, type, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
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
              'h-11 w-full rounded border bg-surface-sunken px-3.5 text-base text-text-primary placeholder:text-text-tertiary',
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
