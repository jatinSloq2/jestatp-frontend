'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Banner } from '@/components/ui/banner';
import { StrategyForm } from '@/components/strategies/strategy-form';
import { useUser } from '@/lib/useUser';
import { api, ApiError, IndicatorCatalog, Strategy, StrategyInput } from '@/lib/api';

export default function EditStrategyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [catalog, setCatalog] = useState<IndicatorCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getStrategy(params.id), api.getIndicatorCatalog()])
      .then(([s, c]) => {
        setStrategy(s);
        setCatalog(c);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load this strategy.'));
  }, [params.id]);

  async function handleSubmit(input: StrategyInput) {
    await api.updateStrategy(params.id, { ...input, changeNote: input.changeNote || 'Edited via Strategy Builder' });
    router.push(`/strategies/${params.id}`);
  }

  const isActive = strategy?.status === 'active';

  return (
    <DashboardShell user={user}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div>
          <Link href={`/strategies/${params.id}`} className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
            ← Back to strategy
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">Edit strategy</h1>
          <p className="mt-1 text-base text-text-secondary">
            Saving creates a new version — the previous one is kept in version history.
          </p>
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        {strategy && catalog ? (
          <StrategyForm
            initial={{
              name: strategy.name,
              description: strategy.description ?? '',
              instrument: strategy.instrument,
              exchange: strategy.exchange,
              segment: strategy.segment,
              timeframe: strategy.timeframe,
              executionMode: strategy.executionMode,
              entry: strategy.entryConditions,
              exit: strategy.exitConditions,
              risk: strategy.riskConfig,
            }}
            catalog={catalog}
            submitLabel="Save changes"
            disabled={isActive}
            disabledReason={isActive ? 'Pause this strategy before editing it.' : undefined}
            onSubmit={handleSubmit}
          />
        ) : !error ? (
          <p className="text-text-secondary">Loading…</p>
        ) : null}
      </div>
    </DashboardShell>
  );
}