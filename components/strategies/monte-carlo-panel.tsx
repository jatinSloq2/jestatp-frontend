'use client';

import { MonteCarloResult } from '@/lib/api';

/**
 * The design doc frames Monte Carlo as showing a distribution rather than
 * one number — this renders the equity/drawdown percentile bands from
 * `runMonteCarlo` (backtestEngine.ts) as simple horizontal bars plus the
 * headline "probability of loss", rather than a single misleadingly
 * precise backtest result.
 */
export function MonteCarloPanel({ result, startingCapital }: { result: MonteCarloResult; startingCapital: number }) {
  if (result.runs === 0) {
    return <p className="text-sm text-text-secondary">No trades to resample — run a backtest with at least one trade first.</p>;
  }

  const { finalEquityPercentiles: eq, maxDrawdownPercentiles: dd } = result;
  const eqMin = Math.min(eq.p5, startingCapital);
  const eqMax = Math.max(eq.p95, startingCapital);
  const eqRange = Math.max(eqMax - eqMin, 1);

  function eqPct(v: number) {
    return ((v - eqMin) / eqRange) * 100;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">
        {result.runs} reshuffles of this run's own {startingCapital > 0 ? '' : ''}trade sequence — same trades, different order, to see how
        much the result depends on which order they happened to land in.
      </p>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-tertiary">Final equity (5th–95th percentile)</p>
        <div className="relative h-3 rounded-full bg-surface-sunken">
          <div
            className="absolute h-full rounded-full bg-accent-trust/30"
            style={{ left: `${eqPct(eq.p5)}%`, width: `${eqPct(eq.p95) - eqPct(eq.p5)}%` }}
          />
          <div className="absolute h-full w-1 rounded-full bg-accent-trust" style={{ left: `calc(${eqPct(eq.p50)}% - 2px)` }} />
          <div
            className="absolute h-full w-0.5 bg-text-tertiary"
            style={{ left: `${eqPct(startingCapital)}%` }}
            title="Starting capital"
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-text-tertiary">
          <span>₹{eq.p5.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="font-medium text-text-primary">₹{eq.p50.toLocaleString(undefined, { maximumFractionDigits: 0 })} (median)</span>
          <span>₹{eq.p95.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-text-tertiary">Max drawdown (5th–95th percentile)</p>
        <div className="relative h-3 rounded-full bg-surface-sunken">
          <div
            className="absolute h-full rounded-full bg-risk-warning/40"
            style={{ left: `${(dd.p5 / Math.max(dd.p95, 1)) * 100}%`, width: `${((dd.p95 - dd.p5) / Math.max(dd.p95, 1)) * 100}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-text-tertiary">
          <span>{dd.p5.toFixed(1)}%</span>
          <span className="font-medium text-text-primary">{dd.p50.toFixed(1)}% (median)</span>
          <span>{dd.p95.toFixed(1)}%</span>
        </div>
      </div>

      <div className="rounded border border-border-strong bg-surface-sunken p-3">
        <p className="text-xs text-text-tertiary">Probability this ends below starting capital, across all reshuffles</p>
        <p className={`mt-1 text-2xl font-semibold ${result.probabilityOfLoss > 0.3 ? 'text-pnl-negative' : 'text-text-primary'}`}>
          {(result.probabilityOfLoss * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
