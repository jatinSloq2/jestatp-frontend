'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface SecondaryAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface RedirectPanelProps {
  /** Short status code or tag shown above the title, e.g. "404". Omit for errors with no fixed code. */
  code?: string;
  icon: LucideIcon;
  tone?: 'neutral' | 'critical';
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondary?: SecondaryAction;
  seconds?: number;
}

/**
 * Full-screen status panel for the 404 and error boundaries.
 * Auto-redirects to `primaryHref` (the dashboard, by default) once the
 * countdown ring finishes, and always offers the same action as a button
 * so nobody has to wait on it.
 */
export function RedirectPanel({
  code,
  icon: Icon,
  tone = 'neutral',
  title,
  description,
  primaryLabel = 'Go to dashboard',
  primaryHref = '/dashboard',
  secondary,
  seconds = 5,
}: RedirectPanelProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);
  const [ringStarted, setRingStarted] = useState(false);

  // Kick the ring animation off one frame after mount so the browser
  // registers the "from" state before transitioning to the "to" state.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRingStarted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      router.replace(primaryHref);
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, router, primaryHref]);

  const iconToneClasses =
    tone === 'critical'
      ? 'border-risk-critical/30 bg-risk-critical/10 text-risk-critical'
      : 'border-border bg-surface text-text-primary';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-[420px] animate-fade-up text-center">
        <Link href="/" className="inline-flex">
          <LogoMark size={32} />
        </Link>

        <div
          className={`mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-lg border ${iconToneClasses}`}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </div>

        {code ? (
          <p className="mt-5 text-sm font-medium tracking-wide text-text-tertiary">{code}</p>
        ) : null}

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
        <p className="mx-auto mt-2 max-w-[340px] text-base leading-relaxed text-text-secondary">
          {description}
        </p>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => router.push(primaryHref)}>
              {primaryLabel}
            </Button>

            {secondary ? (
              secondary.href ? (
                <Link
                  href={secondary.href}
                  className="inline-flex h-12 items-center justify-center rounded border border-border-strong bg-surface-raised px-5 text-base font-medium text-text-primary transition-colors duration-150 ease-confident hover:border-text-tertiary"
                >
                  {secondary.label}
                </Link>
              ) : (
                <Button variant="secondary" size="lg" onClick={secondary.onClick}>
                  {secondary.label}
                </Button>
              )
            ) : null}
          </div>

          <div className="flex items-center gap-2.5 text-sm text-text-tertiary">
            <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
              <svg viewBox="0 0 44 44" className="h-6 w-6 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r={RADIUS}
                  fill="none"
                  stroke="rgb(var(--border))"
                  strokeWidth="3"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={RADIUS}
                  fill="none"
                  stroke="rgb(var(--accent-trust))"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringStarted ? CIRCUMFERENCE : 0}
                  style={{ transition: `stroke-dashoffset ${seconds}s linear` }}
                />
              </svg>
              <span className="absolute text-[10px] font-medium tabular-nums text-text-primary">
                {remaining}
              </span>
            </span>
            Redirecting you to the dashboard
          </div>
        </div>
      </div>
    </div>
  );
}
