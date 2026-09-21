'use client';

import { BacktestStats } from '@/lib/api';

function formatPercent(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
function formatMoney(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}₹${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function pnlClass(v: number) {
  if (v > 0) return 'text-pnl-positive';
  if (v < 0) return 'text-pnl-negative';
  return 'text-text-secondary';
}

export function BacktestStatsGrid({ stats }: { stats: BacktestStats }) {
  const items: { label: string; value: string; className?: string }[] = [
    { label: 'Total trades', value: String(stats.totalTrades) },
    { label: 'Win rate', value: `${stats.winRatePercent.toFixed(1)}%` },
    { label: 'Total P&L', value: formatMoney(stats.totalPnl), className: pnlClass(stats.totalPnl) },
    { label: 'Return', value: formatPercent(stats.totalReturnPercent), className: pnlClass(stats.totalReturnPercent) },
    { label: 'Max drawdown', value: `${stats.maxDrawdownPercent.toFixed(2)}%`, className: 'text-risk-warning' },
    {
      label: 'Profit factor',
      value: stats.profitFactor === null ? '—' : stats.profitFactor.toFixed(2),
    },
    { label: 'Sharpe ratio', value: stats.sharpeRatio === null ? '—' : stats.sharpeRatio.toFixed(2) },
    { label: 'Best trade', value: formatMoney(stats.bestTrade), className: pnlClass(stats.bestTrade) },
    { label: 'Worst trade', value: formatMoney(stats.worstTrade), className: pnlClass(stats.worstTrade) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded border border-border bg-surface-sunken p-3">
          <p className="text-xs text-text-tertiary">{item.label}</p>
          <p className={`mt-1 font-mono text-lg font-semibold text-text-primary ${item.className ?? ''}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}