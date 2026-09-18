'use client';

import { useId } from 'react';
import clsx from 'clsx';

/**
 * Brand mark for JestATP — a rounded square carrying an ascending
 * candlestick/breakout motif (automated strategies turning data into a
 * trend). Built from CSS-variable-driven gradient stops (accent-trust →
 * pnl-positive) so it re-tints automatically between the light and dark
 * theme, same as every other token-driven surface in this app.
 *
 * `useId()` keeps the gradient/clip ids collision-free when the mark is
 * rendered more than once on a page (e.g. desktop nav + mobile header).
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `jestatp-mark-grad-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('shrink-0', className)}
      role="img"
      aria-label="JestATP"
    >
      <defs>
        <linearGradient id={gradientId} x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(var(--accent-trust-strong))" />
          <stop offset="1" stopColor="rgb(var(--pnl-positive))" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${gradientId})`} />

      {/* Ascending candlesticks, rising left to right */}
      <rect x="7" y="18" width="3.4" height="7" rx="1.2" fill="rgb(var(--text-on-accent))" fillOpacity="0.55" />
      <rect x="13.3" y="13.5" width="3.4" height="11.5" rx="1.2" fill="rgb(var(--text-on-accent))" fillOpacity="0.75" />
      <rect x="19.6" y="9.5" width="3.4" height="15.5" rx="1.2" fill="rgb(var(--text-on-accent))" />

      {/* Breakout arrow tracing the trend up and out */}
      <path
        d="M6.5 17.5L13 11.5L17 14.8L25.2 6"
        stroke="rgb(var(--text-on-accent))"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.6 6H25.2V11.6"
        stroke="rgb(var(--text-on-accent))"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Icon + wordmark, for navbars, auth panels, and the footer brand column. */
export function Logo({
  className,
  markSize = 32,
  wordmarkClassName,
}: {
  className?: string;
  markSize?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span className={clsx('flex items-center gap-2.5', className)}>
      <LogoMark size={markSize} />
      <span className={clsx('text-lg font-semibold tracking-tight text-text-primary', wordmarkClassName)}>
        JestATP
      </span>
    </span>
  );
}
