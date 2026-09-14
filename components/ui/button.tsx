'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-trust text-text-on-accent hover:bg-accent-trust-strong disabled:bg-accent-trust/50',
  secondary:
    'bg-surface-raised text-text-primary border border-border-strong hover:border-text-tertiary disabled:opacity-50',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-raised disabled:opacity-50',
  destructive: 'bg-risk-critical text-white hover:bg-risk-critical/90 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded font-medium',
          'transition-colors duration-150 ease-confident',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-trust focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
