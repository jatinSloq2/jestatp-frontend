'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAcknowledgeAlert, useAlerts } from '@/lib/queries/useAlerts';
import { AlertRecord } from '@/lib/api';

function BellIcon({ className }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 2.5c-3 0-4.5 2.2-4.5 5v2.3c0 .5-.2 1-.6 1.4l-.8.9c-.5.6-.1 1.4.6 1.4h10.6c.7 0 1.1-.8.6-1.4l-.8-.9c-.4-.4-.6-.9-.6-1.4V7.5c0-2.8-1.5-5-4.5-5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8.2 16a1.8 1.8 0 0 0 3.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function severityDot(severity: AlertRecord['severity']): string {
  if (severity === 'critical') return 'bg-risk-critical';
  if (severity === 'warning') return 'bg-risk-warning';
  return 'bg-accent-trust';
}

export function AlertsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { alerts, unacknowledgedCount } = useAlerts({ unacknowledged: true, limit: 6 });
  const acknowledgeMutation = useAcknowledgeAlert();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Alerts"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
      >
        <BellIcon />
        {unacknowledgedCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-critical px-1 text-[10px] font-semibold leading-none text-white">
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-md border border-border bg-surface py-2 shadow-panel animate-fade-up">
          <div className="flex items-center justify-between border-b border-border px-3.5 pb-2.5">
            <span className="text-sm font-medium text-text-primary">Alerts</span>
            <Link href="/alerts" className="text-xs font-medium text-accent-trust hover:text-accent-trust-strong">
              View all
            </Link>
          </div>

          {alerts.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-text-tertiary">No unacknowledged alerts.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex gap-2.5 border-b border-border px-3.5 py-3 last:border-b-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot(alert.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{alert.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary">
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        className="font-medium text-accent-trust hover:text-accent-trust-strong disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
