'use client';

import { StrategyActivity, StrategyTradeRecord } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Banner } from '@/components/ui/banner';

function fmtPnl(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function pnlClass(value: number): string {
  return value > 0 ? 'text-pnl-positive' : value < 0 ? 'text-pnl-negative' : 'text-text-secondary';
}

function TradeRow({ trade }: { trade: StrategyTradeRecord }) {
  const isOpen = trade.exitTimestamp === null;
  return (
    <tr>
      <td className="py-2.5 pr-4">
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
            trade.mode === 'live'
              ? 'border-risk-critical/30 bg-risk-critical/10 text-pnl-negative'
              : 'border-border-strong bg-surface-raised text-text-tertiary'
          }`}
        >
          {trade.mode}
        </span>
      </td>
      <td className="py-2.5 pr-4 text-text-tertiary">{new Date(trade.entryTimestamp).toLocaleString()}</td>
      <td className="py-2.5 pr-4 font-mono text-text-secondary">₹{trade.entryPrice}</td>
      <td className="py-2.5 pr-4 font-mono text-text-secondary">{isOpen ? '—' : `₹${trade.exitPrice}`}</td>
      <td className="py-2.5 pr-4 font-mono text-text-secondary">{trade.quantity}</td>
      <td className="py-2.5 pr-4 text-text-tertiary">{trade.exitReason?.replace(/_/g, ' ') ?? (isOpen ? 'holding' : '—')}</td>
      <td className={`py-2.5 pr-4 text-right font-mono font-medium ${trade.pnl !== null ? pnlClass(trade.pnl) : 'text-text-tertiary'}`}>
        {trade.pnl !== null ? fmtPnl(trade.pnl) : '—'}
      </td>
    </tr>
  );
}

export function LiveActivityPanel({ activity }: { activity: StrategyActivity }) {
  const { runtime, summary, trades, executionMode, broker } = activity;
  const openPosition = runtime?.openPosition ?? null;

  return (
    <div className="flex flex-col gap-4">
      {executionMode === 'live' ? (
        <Banner tone="warning">
          This strategy trades with real money through {broker}. A rejected exit order is retried automatically, not silently
          dropped — check the backend logs if a position looks stuck here longer than expected.
        </Banner>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Status', openPosition ? `Holding ${openPosition.quantity}` : 'Flat', null],
          ['Closed trades', summary.closedTrades, null],
          ['Win rate', `${summary.winRatePercent.toFixed(1)}%`, null],
          ['Total P&L', fmtPnl(summary.totalPnl), pnlClass(summary.totalPnl)],
        ].map(([label, value, colorClass]) => (
          <Card key={label as string} className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</span>
            <span className={`text-lg font-semibold tabular-nums ${colorClass ?? 'text-text-primary'}`}>{value}</span>
          </Card>
        ))}
      </div>

      {openPosition ? (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 border-accent-trust/30 bg-accent-trust-soft/40 text-sm">
          <span className="font-semibold text-text-primary">Currently holding {openPosition.quantity}</span>
          <span className="text-text-secondary">
            Entry: ₹{openPosition.entryPrice} at {new Date(openPosition.entryTimestamp).toLocaleString()}
          </span>
          <span className="text-text-secondary">Stop: ₹{openPosition.trailingStopPrice ?? openPosition.stopLossPrice}</span>
          <span className="text-text-secondary">Target: ₹{openPosition.targetPrice}</span>
          {executionMode === 'live' ? (
            <span className="text-text-tertiary">
              {openPosition.entryOrderId ? 'Order placed with broker' : 'Entry order pending — check logs'}
            </span>
          ) : null}
        </Card>
      ) : null}

      <Card className="overflow-x-auto">
        {trades.rows.length === 0 ? (
          <p className="text-sm text-text-secondary">No trades yet — this strategy hasn't produced a signal since it went active.</p>
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-tertiary">
                <th className="pb-2 pr-4">Mode</th>
                <th className="pb-2 pr-4">Entry time</th>
                <th className="pb-2 pr-4">Entry</th>
                <th className="pb-2 pr-4">Exit</th>
                <th className="pb-2 pr-4">Qty</th>
                <th className="pb-2 pr-4">Reason</th>
                <th className="pb-2 pr-4 text-right">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trades.rows.map((t) => (
                <TradeRow key={t.id} trade={t} />
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {trades.meta.totalPages > 1 ? (
        <p className="text-xs text-text-tertiary">
          Page {trades.meta.page} of {trades.meta.totalPages} · {trades.meta.total} total trades
        </p>
      ) : null}
    </div>
  );
}
