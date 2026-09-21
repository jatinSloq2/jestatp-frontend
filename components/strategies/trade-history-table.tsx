'use client';

import { Fragment, useState } from 'react';
import { BacktestTrade, ConditionExplanation } from '@/lib/api';

function formatMoney(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}₹${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

const EXIT_REASON_LABEL: Record<BacktestTrade['exitReason'], string> = {
  exit_condition: 'Exit condition',
  stop_loss: 'Stop loss',
  target: 'Target',
  trailing_stop_loss: 'Trailing SL',
  time_exit: 'Time exit',
  end_of_data: 'End of data',
};

function ExplanationNode({ node, depth = 0 }: { node: ConditionExplanation; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 14 }} className="py-0.5">
      <span className={node.result ? 'text-pnl-positive' : 'text-pnl-negative'}>{node.result ? '✓' : '✗'}</span>{' '}
      <span className="text-text-secondary">{node.description}</span>
      {node.value !== undefined && node.value !== null ? <span className="font-mono text-text-tertiary"> = {node.value.toFixed(2)}</span> : null}
      {node.children?.map((child, i) => <ExplanationNode key={i} node={child} depth={depth + 1} />)}
    </div>
  );
}

/**
 * "Trade History" + the per-trade "Conditions at Entry" drill-down from the
 * design doc — click a row to expand its entryExplanation tree (DSL
 * strategies only; see backtestEngine.ts's explainEntryAt). Python
 * strategies don't get this since there's no fixed condition tree to walk;
 * their equivalent is the run's `logs` (ctx.log(...) calls), shown
 * elsewhere.
 */
export function TradeHistoryTable({ trades }: { trades: BacktestTrade[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (trades.length === 0) {
    return <p className="text-sm text-text-secondary">No trades in this run.</p>;
  }

  return (
    <div className="overflow-x-auto rounded border border-border-strong">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-text-tertiary">
            <th className="px-3 py-2">Entry</th>
            <th className="px-3 py-2">Exit</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2">Reason</th>
            <th className="px-3 py-2 text-right">P&amp;L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {trades.map((t, i) => (
            <Fragment key={i}>
              <tr
                className={t.entryExplanation ? 'cursor-pointer hover:bg-surface-sunken' : ''}
                onClick={() => t.entryExplanation && setExpanded(expanded === i ? null : i)}
              >
                <td className="px-3 py-2">
                  <div className="font-mono">{t.entryPrice.toFixed(2)}</div>
                  <div className="text-xs text-text-tertiary">{new Date(t.entryTimestamp).toLocaleString()}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="font-mono">{t.exitPrice.toFixed(2)}</div>
                  <div className="text-xs text-text-tertiary">{new Date(t.exitTimestamp).toLocaleString()}</div>
                </td>
                <td className="px-3 py-2 text-right font-mono">{t.quantity}</td>
                <td className="px-3 py-2 text-text-secondary">{EXIT_REASON_LABEL[t.exitReason]}</td>
                <td className={`px-3 py-2 text-right font-mono font-medium ${t.pnl >= 0 ? 'text-pnl-positive' : 'text-pnl-negative'}`}>
                  {formatMoney(t.pnl)}
                  {t.entryExplanation ? <span className="ml-1 text-text-tertiary">{expanded === i ? '▲' : '▼'}</span> : null}
                </td>
              </tr>
              {expanded === i && t.entryExplanation ? (
                <tr>
                  <td colSpan={5} className="bg-surface-sunken px-4 py-3 font-mono text-xs">
                    <p className="mb-1.5 font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">Conditions at entry</p>
                    <ExplanationNode node={t.entryExplanation} />
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
