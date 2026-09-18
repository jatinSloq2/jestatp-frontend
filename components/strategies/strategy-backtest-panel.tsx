'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiError, BacktestResult, ConditionBlock, RiskConfig, Segment, Timeframe } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { RefreshButton } from '@/components/ui/refresh-button';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { usePreviewBacktest } from '@/lib/queries/useStrategies';
import { BacktestChart } from './backtest-chart';
import { BacktestStatsGrid } from './backtest-stats';

export function StrategyBacktestPanel({
  instrument,
  exchange,
  segment,
  timeframe,
  entry,
  exit,
  risk,
}: {
  instrument: string;
  exchange: string;
  segment: Segment;
  timeframe: Timeframe;
  entry: ConditionBlock;
  exit: ConditionBlock;
  risk: RiskConfig;
}) {
  const { connections, connectedBrokers, broker, setBroker, loading: brokersLoading } = useConnectedBrokers();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const previewBacktestMutation = usePreviewBacktest();

  async function runBacktest() {
    if (!broker) return;
    setError(null);
    try {
      const data = await previewBacktestMutation.mutateAsync({ instrument, exchange, segment, timeframe, entry, exit, risk, broker });
      setResult(data);
      setHasRun(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not run the backtest.');
    }
  }

  if (!brokersLoading && connectedBrokers.length === 0) {
    return (
      <div className="rounded border border-border-strong bg-surface-sunken p-4 text-sm text-text-secondary">
        Connect a broker to backtest this strategy against real historical data.{' '}
        <Link href="/brokers" className="font-medium text-accent-trust hover:text-accent-trust-strong">
          Connect a broker →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded border border-border-strong bg-surface-sunken p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} /> : null}
          <Button type="button" size="md" loading={previewBacktestMutation.isPending} disabled={!broker} onClick={runBacktest}>
            {hasRun ? 'Re-run backtest' : 'Run backtest'}
          </Button>
        </div>
        {hasRun ? <RefreshButton onClick={runBacktest} loading={previewBacktestMutation.isPending} label="Refresh" /> : null}
      </div>

      {error ? <Banner tone="negative">{error}</Banner> : null}

      {!hasRun && !previewBacktestMutation.isPending ? (
        <p className="text-sm text-text-tertiary">
          Runs the entry/exit conditions above against real historical candles for {instrument || 'this instrument'} on{' '}
          {exchange || 'the selected exchange'} ({timeframe}), fetched live from your connected broker — not sample data.
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