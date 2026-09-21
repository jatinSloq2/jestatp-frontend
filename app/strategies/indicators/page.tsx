'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { useUser } from '@/lib/useUser';
import { CustomIndicator } from '@/lib/api';
import { useCustomIndicators, useDeleteCustomIndicator } from '@/lib/queries/useCustomIndicators';
import { CustomIndicatorEditor } from '@/components/strategies/custom-indicator-editor';

export default function CustomIndicatorsPage() {
  const { user } = useUser();
  const { data, isLoading, error } = useCustomIndicators();
  const deleteMutation = useDeleteCustomIndicator();
  const [editing, setEditing] = useState<CustomIndicator | 'new' | null>(null);

  const indicators = data?.data ?? [];

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <Link href="/strategies" className="hover:text-text-secondary">
                Strategies
              </Link>
              <span>/</span>
              <span>Custom Indicators</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">Custom Indicators</h1>
            <p className="mt-1 text-base text-text-secondary">
              Build your own indicator in Python, then reference it from any strategy with{' '}
              <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-sm">ctx.custom(&quot;name&quot;)</code>.
            </p>
          </div>
          {editing === null ? <Button onClick={() => setEditing('new')}>+ Create Indicator</Button> : null}
        </div>

        {error ? <Banner tone="negative">{error.message}</Banner> : null}

        {editing !== null ? (
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">{editing === 'new' ? 'Create Custom Indicator' : `Edit "${editing.name}"`}</h2>
            <CustomIndicatorEditor
              existing={editing === 'new' ? undefined : editing}
              onSaved={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          </Card>
        ) : isLoading ? (
          <p className="text-sm text-text-secondary">Loading…</p>
        ) : indicators.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">
              You haven&apos;t created any custom indicators yet. They&apos;re a good fit for a calculation you use across several
              strategies, or one built-in indicators (SMA/EMA/RSI/MACD/Bollinger/Stochastic/Supertrend/VWAP) don&apos;t cover.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.map((indicator) => (
              <Card key={indicator.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-text-primary">{indicator.name}</h3>
                  <span className="shrink-0 rounded-full bg-surface-sunken px-2 py-0.5 text-xs text-text-tertiary">{indicator.kind}</span>
                </div>
                {indicator.description ? <p className="text-sm text-text-secondary">{indicator.description}</p> : null}
                {Object.keys(indicator.params).length > 0 ? (
                  <p className="font-mono text-xs text-text-tertiary">
                    {Object.entries(indicator.params)
                      .map(([k, v]) => `${k}=${v}`)
                      .join(', ')}
                  </p>
                ) : null}
                <div className="mt-2 flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setEditing(indicator)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                   
                    variant="secondary"
                    loading={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Delete "${indicator.name}"? Strategies that reference it will just get no signal from it.`)) {
                        deleteMutation.mutate(indicator.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
