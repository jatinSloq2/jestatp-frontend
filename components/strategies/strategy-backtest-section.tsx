'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, BacktestResult, WalkForwardResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { RefreshButton } from '@/components/ui/refresh-button';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { useRunBacktest } from '@/lib/queries/useStrategies';
import { BacktestChart } from './backtest-chart';
import { BacktestStatsGrid } from './backtest-stats';
import { TradeHistoryTable } from './trade-history-table';
import { WalkForwardPanel } from './walk-forward-panel';
import { MonteCarloPanel } from './monte-carlo-panel';

type Mode = 'standard' | 'walk_forward' | 'monte_carlo';

const MODE_LABEL: Record<Mode, string> = {
  standard: 'Standard',
  walk_forward: 'Walk Forward',
  monte_carlo: 'Monte Carlo',
};

function isWalkForwardResult(result: BacktestResult | WalkForwardResult): result is WalkForwardResult {
  return result.mode === 'walk_forward';
}

/**
 * The strategy detail page's "Backtest" tab. Three modes share one "Run"
 * button and one broker picker:
 *   - standard: a normal single-pass backtest (equity curve + trade table,
 *     with a per-trade "Conditions at Entry" debugger for DSL strategies)
 *   - walk_forward: DSL strategies only (see runWalkForward's docstring for
 *     why) — out-of-sample stats per train/test fold
 *   - monte_carlo: reshuffles the standard run's own trades to show a
 *     distribution of outcomes rather than one number
 */
export function StrategyBacktestSection({ strategyId, language }: { strategyId: string; language?: 'dsl' | 'python' }) {
  const { connections, connectedBrokers, broker, setBroker, loading: brokersLoading } = useConnectedBrokers();
  const [mode, setMode] = useState<Mode>('standard');
  const [result, setResult] = useState<BacktestResult | WalkForwardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const runBacktestMutation = useRunBacktest(strategyId);

  const availableModes: Mode[] = language === 'python' ? ['standard', 'monte_carlo'] : ['standard', 'walk_forward', 'monte_carlo'];

  async function run(nextMode: Mode) {
    if (!broker) return;
    setMode(nextMode);
    setError(null);
    try {
      const data = await runBacktestMutation.mutateAsync({ broker, mode: nextMode });
      setResult(data);
      setHasRun(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not run the backtest.');
    }
  }

  if (!brokersLoading && connectedBrokers.length === 0) {
    return (
      <div className="text-sm text-text-secondary">
        Connect a broker to backtest this strategy against real historical data.{' '}
        <Link href="/brokers" className="font-medium text-accent-trust hover:text-accent-trust-strong">
          Connect a broker →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} /> : null}

          <div className="flex rounded border border-border-strong bg-surface-sunken p-0.5">
            {availableModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  mode === m ? 'bg-surface-raised text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>

          <Button type="button" size="md" loading={runBacktestMutation.isPending} disabled={!broker} onClick={() => run(mode)}>
            {hasRun ? `Run ${MODE_LABEL[mode]}` : `Run ${MODE_LABEL[mode]} backtest`}
          </Button>
        </div>
        {hasRun ? <RefreshButton onClick={() => run(mode)} loading={runBacktestMutation.isPending} /> : null}
      </div>

      {error ? <Banner tone="negative">{error}</Banner> : null}

      {!hasRun && !runBacktestMutation.isPending ? (
        <p className="text-sm text-text-tertiary">
          {mode === 'standard' &&
            "Runs this strategy's live entry/exit conditions against real historical candles from your connected broker."}
          {mode === 'walk_forward' &&
            'Splits the date range into consecutive train/test folds and reports how the strategy performs out-of-sample in each — a strategy that only works in one fold is a warning sign.'}
          {mode === 'monte_carlo' &&
            "Reshuffles this run's own trades thousands of times to show a range of outcomes, not just one number — and how often the strategy would have lost money by chance alone."}
        </p>
      ) : null}

      {result && !isWalkForwardResult(result) && mode === 'standard' ? (
        <div className="flex flex-col gap-4">
          <BacktestStatsGrid stats={result.stats} />
          <BacktestChart result={result} />
          <TradeHistoryTable trades={result.trades} />
          <p className="text-xs text-text-tertiary">
            {new Date(result.from).toLocaleDateString()} – {new Date(result.to).toLocaleDateString()} via {result.broker}
          </p>
          {result.logs && result.logs.length > 0 ? (
            <details className="rounded border border-border-strong bg-surface-raised p-3 text-xs">
              <summary className="cursor-pointer select-none font-medium text-text-secondary">Strategy logs ({result.logs.length})</summary>
              <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-text-tertiary">{result.logs.join('\n')}</pre>
            </details>
          ) : null}
        </div>
      ) : null}

      {result && !isWalkForwardResult(result) && mode === 'monte_carlo' && result.monteCarlo ? (
        <div className="flex flex-col gap-4">
          <BacktestStatsGrid stats={result.stats} />
          <MonteCarloPanel result={result.monteCarlo} startingCapital={result.stats.startingCapital} />
        </div>
      ) : null}

      {result && isWalkForwardResult(result) ? <WalkForwardPanel result={result.walkForward} /> : null}
    </div>
  );
}
