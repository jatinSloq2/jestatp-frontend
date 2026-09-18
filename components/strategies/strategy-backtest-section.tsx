'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, BacktestResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { RefreshButton } from '@/components/ui/refresh-button';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { useRunBacktest } from '@/lib/queries/useStrategies';
import { BacktestChart } from './backtest-chart';
import { BacktestStatsGrid } from './backtest-stats';

export function StrategyBacktestSection({ strategyId }: { strategyId: string }) {
  const { connections, connectedBrokers, broker, setBroker, loading: brokersLoading } = useConnectedBrokers();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const runBacktestMutation = useRunBacktest(strategyId);

  async function run() {
    if (!broker) return;
    setError(null);
    try {
      const data = await runBacktestMutation.mutateAsync({ broker });
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
          <Button type="button" size="md" loading={runBacktestMutation.isPending} disabled={!broker} onClick={run}>
            {hasRun ? 'Re-run backtest' : 'Run backtest'}
          </Button>
        </div>
        {hasRun ? <RefreshButton onClick={run} loading={runBacktestMutation.isPending} /> : null}
      </div>

      {error ? <Banner tone="negative">{error}</Banner> : null}

      {!hasRun && !runBacktestMutation.isPending ? (
        <p className="text-sm text-text-tertiary">
          Runs this strategy's live entry/exit conditions against real historical candles from your connected broker.
        </p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-4">
          <BacktestStatsGrid stats={result.stats} />
          <BacktestChart result={result} />
          <p className="text-xs text-text-tertiary">
            {new Date(result.from).toLocaleDateString()} – {new Date(result.to).toLocaleDateString()} via {result.broker}
          </p>
        </div>
      ) : null}
    </div>
  );
}