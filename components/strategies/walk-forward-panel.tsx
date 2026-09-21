'use client';

import { WalkForwardResult } from '@/lib/api';
import { BacktestStatsGrid } from './backtest-stats';

/**
 * One row per fold's out-of-sample (test) window — see backtestEngine.ts's
 * runWalkForward. The combined stats at the bottom are what the design doc
 * cares about ("does this hold up out-of-sample across multiple periods"),
 * the per-fold breakdown is there to show *which* periods it held up in.
 */
export function WalkForwardPanel({ result }: { result: WalkForwardResult['walkForward'] }) {
  if (result.folds.length === 0) {
    return <p className="text-sm text-text-secondary">Not enough candles for even one fold — try a wider date range.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">Combined out-of-sample stats (all folds' test windows pooled)</p>
        <BacktestStatsGrid stats={result.combinedTestStats} />
      </div>

      <div className="overflow-x-auto rounded border border-border-strong">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-text-tertiary">
              <th className="px-3 py-2">Fold</th>
              <th className="px-3 py-2">Test window (bars)</th>
              <th className="px-3 py-2 text-right">Trades</th>
              <th className="px-3 py-2 text-right">Win rate</th>
              <th className="px-3 py-2 text-right">Return</th>
              <th className="px-3 py-2 text-right">Max DD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.folds.map((fold, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-text-primary">{i + 1}</td>
                <td className="px-3 py-2 font-mono text-text-tertiary">
                  {fold.testFrom}–{fold.testTo}
                </td>
                <td className="px-3 py-2 text-right font-mono">{fold.testResult.stats.totalTrades}</td>
                <td className="px-3 py-2 text-right font-mono">{fold.testResult.stats.winRatePercent.toFixed(0)}%</td>
                <td
                  className={`px-3 py-2 text-right font-mono ${fold.testResult.stats.totalReturnPercent >= 0 ? 'text-pnl-positive' : 'text-pnl-negative'}`}
                >
                  {fold.testResult.stats.totalReturnPercent >= 0 ? '+' : ''}
                  {fold.testResult.stats.totalReturnPercent.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right font-mono text-risk-warning">{fold.testResult.stats.maxDrawdownPercent.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-tertiary">
        A strategy that's profitable in every fold is more trustworthy than one whose combined number is driven by a single strong fold —
        that pattern usually means overfitting to one period rather than a real edge.
      </p>
    </div>
  );
}
