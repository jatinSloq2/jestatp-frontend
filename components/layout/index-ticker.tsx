import clsx from 'clsx';

export const referenceIndices = [
  { label: 'NIFTY 50', value: '24,812.35', change: '+58.85', changePercent: '+0.24%', up: true },
  { label: 'SENSEX', value: '81,244.10', change: '+222.73', changePercent: '+0.30%', up: true },
  { label: 'BANK NIFTY', value: '52,006.80', change: '+253.05', changePercent: '+0.45%', up: true },
  { label: 'USD/INR', value: '83.42', change: '-0.06', changePercent: '-0.07%', up: false },
];

/**
 * Slim reference-levels strip, styled after the index row on the Groww
 * screenshots this redesign is based on. Values are static placeholders,
 * not a live feed — this app has no market-data connection yet — so it is
 * always labelled "for orientation only" and must never be presented as a
 * live tick.
 */
export function IndexTicker({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={clsx('flex items-center gap-6 overflow-x-auto', className)}>
      {referenceIndices.map((row) => (
        <div key={row.label} className="flex shrink-0 items-baseline gap-2">
          <span className={clsx('font-medium text-text-tertiary', compact ? 'text-xs' : 'text-sm')}>
            {row.label}
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
