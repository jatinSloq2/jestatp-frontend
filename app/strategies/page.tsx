'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { StrategyStatusBadge } from '@/components/ui/status-badge';
import { useUser } from '@/lib/useUser';
import { api, ApiError, Strategy, StrategyStatus } from '@/lib/api';

const STATUS_FILTERS: (StrategyStatus | 'all')[] = ['all', 'draft', 'active', 'paused', 'archived'];

export default function StrategiesPage() {
  const { user, loading: userLoading } = useUser();
  const [strategies, setStrategies] = useState<Strategy[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<StrategyStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const { data } = await api.listStrategies(statusFilter === 'all' ? undefined : { status: statusFilter });
      setStrategies(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load strategies.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function withBusy(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Strategies</h1>
            <p className="mt-1 text-base text-text-secondary">Build, validate, and run automated strategies.</p>
          </div>
          <Link href="/strategies/new">
            <Button type="button">New strategy</Button>
          </Link>
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'border-accent-trust bg-accent-trust-soft text-accent-trust-strong'
                  : 'border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {userLoading || !strategies ? (
          <p className="text-text-secondary">Loading…</p>
        ) : strategies.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">
              No strategies {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'yet'}.
            </p>
            <Link href="/strategies/new" className="mt-4 inline-block">
              <Button type="button">Create your first strategy</Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {strategies.map((s) => {
              const busy = busyId === s.id;
              return (
                <Card key={s.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/strategies/${s.id}`} className="truncate text-base font-semibold text-text-primary hover:text-accent-trust">
                        {s.name}
                      </Link>
                      <StrategyStatusBadge status={s.status} />
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {s.instrument} · {s.exchange} · {s.timeframe} · {s.executionMode} · v{s.currentVersion}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {s.status === 'draft' || s.status === 'paused' ? (
                      <Button type="button" size="md" loading={busy} onClick={() => withBusy(s.id, () => api.activateStrategy(s.id))}>
                        Activate
                      </Button>
                    ) : null}
                    {s.status === 'active' ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        loading={busy}
                        onClick={() => withBusy(s.id, () => api.pauseStrategy(s.id))}
                      >
                        Pause
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      loading={busy}
                      onClick={() => withBusy(s.id, () => api.duplicateStrategy(s.id))}
                    >
                      Duplicate
                    </Button>
                    {s.status !== 'archived' && s.status !== 'active' ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="md"
                        loading={busy}
                        onClick={() => {
                          if (confirm(`Archive "${s.name}"? This can't be undone from here.`)) {
                            withBusy(s.id, () => api.archiveStrategy(s.id));
                          }
                        }}
                      >
                        Archive
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}