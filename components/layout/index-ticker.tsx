'use client';

import clsx from 'clsx';
import { useConnectedBrokers } from '@/components/trading/broker-picker';
import { useIndexTickerRows } from '@/lib/queries/useIndexQuotes';

/**
 * Slim reference-levels strip, styled after the index row on the Groww
 * screenshots this redesign is based on. Shows real live quotes (via
 * GET /brokers/:broker/quote) from the user's first connected broker when
 * available; otherwise — or for any single symbol a broker doesn't resolve
 * — falls back to a clearly-labeled static reference value per row, so
 * this never silently presents stale numbers as if they were live.
 */
export function IndexTicker({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { broker } = useConnectedBrokers();
  const rows = useIndexTickerRows(broker);

  return (
    <div className={clsx('flex items-center justify-between overflow-x-auto px-6', className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex shrink-0 items-baseline gap-4">
          <span className={clsx('font-medium text-text-tertiary', compact ? 'text-xs' : 'text-sm')}>
            {row.label}
            {!row.isLive ? <span className="ml-1 align-super text-[9px] opacity-60">•</span> : null}
          </span>
          <span className={clsx('font-mono tabular text-text-primary', compact ? 'text-xs' : 'text-sm')}>
            {row.value}
          </span>
          <span
            className={clsx(
              'font-mono tabular text-xs',
              row.up ? 'text-pnl-positive' : 'text-pnl-negative',
            )}
          >
            {row.changePercent}
          </span>
        </div>
      ))}
    </div>
  );
}
