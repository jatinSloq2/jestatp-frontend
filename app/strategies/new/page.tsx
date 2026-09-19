'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Banner } from '@/components/ui/banner';
import { StrategyForm } from '@/components/strategies/strategy-form';
import { useUser } from '@/lib/useUser';
import { ApiError, StrategyInput } from '@/lib/api';
import { useIndicatorCatalog, useCreateStrategy } from '@/lib/queries/useStrategies';

const DEFAULT_INPUT: StrategyInput = {
  name: '',
  description: '',
  instrument: '',
  exchange: '',
  segment: 'equity',
  timeframe: '5m',
  broker: 'zerodha',
  executionMode: 'paper',
  language: 'dsl',
  entry: { conditions: [], logic: 'AND' },
  exit: { conditions: [], logic: 'AND' },
  risk: {
    capitalAllocated: 50000,
    maxLossPerDay: 2000,
    maxPositions: 3,
    maxTradesPerDay: 10,
    positionSizing: { method: 'fixed_quantity', value: 1 },
    stopLoss: { type: 'percent', value: 1 },
    target: { type: 'percent', value: 2 },
  },
};

export default function NewStrategyPage() {
  const router = useRouter();
  const { user } = useUser();
  const catalogQuery = useIndicatorCatalog();
  const createMutation = useCreateStrategy();

  const catalog = catalogQuery.data ?? null;
  const error = catalogQuery.error instanceof ApiError ? catalogQuery.error.message : null;

  async function handleSubmit(input: StrategyInput) {
    const strategy = await createMutation.mutateAsync(input);
    router.push(`/strategies/${strategy.id}`);
  }

  return (
    <DashboardShell user={user}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <Link href="/strategies" className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
            ← Back to strategies
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">New strategy</h1>
          <p className="mt-1 text-base text-text-secondary">
            Define entry and exit conditions and risk limits. It's saved as a draft until you activate it.
          </p>
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        {catalog ? (
          <StrategyForm initial={DEFAULT_INPUT} catalog={catalog} submitLabel="Create strategy" onSubmit={handleSubmit} />
        ) : !error ? (
          <p className="text-text-secondary">Loading builder…</p>
        ) : null}
      </div>
    </DashboardShell>
  );
}