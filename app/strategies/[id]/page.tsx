'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { StrategyStatusBadge } from '@/components/ui/status-badge';
import { RefreshButton } from '@/components/ui/refresh-button';
import { StrategyBacktestSection } from '@/components/strategies/strategy-backtest-section';
import { useUser } from '@/lib/useUser';
import { api, ApiError, Strategy, StrategyVersion } from '@/lib/api';

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-72 overflow-auto rounded border border-border-strong bg-surface-sunken p-3 text-xs text-text-secondary">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function StrategyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [versions, setVersions] = useState<StrategyVersion[] | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [s, v] = await Promise.all([api.getStrategy(params.id), api.listStrategyVersions(params.id)]);
      setStrategy(s);
      setVersions(v);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this strategy.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  if (!strategy) {
    return (
      <DashboardShell user={user}>
        {error ? <Banner tone="negative">{error}</Banner> : <p className="text-text-secondary">Loading…</p>}
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/strategies" className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
              ← Back to strategies
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{strategy.name}</h1>
              <StrategyStatusBadge status={strategy.status} />
            </div>
            {strategy.description ? <p className="mt-1 text-base text-text-secondary">{strategy.description}</p> : null}
          </div>
          <RefreshButton onClick={load} loading={loading} />
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        <div className="flex flex-wrap gap-2">
          {strategy.status === 'draft' || strategy.status === 'paused' ? (
            <Button type="button" loading={busy} onClick={() => runAction(() => api.activateStrategy(strategy.id))}>
              Activate
            </Button>
          ) : null}
          {strategy.status === 'active' ? (
            <Button type="button" variant="secondary" loading={busy} onClick={() => runAction(() => api.pauseStrategy(strategy.id))}>
              Pause
            </Button>
          ) : null}
          {strategy.status !== 'active' ? (
            <Link href={`/strategies/${strategy.id}/edit`}>
              <Button type="button" variant="secondary">
                Edit
              </Button>
            </Link>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            loading={busy}
            onClick={() =>
              runAction(async () => {
                const dup = await api.duplicateStrategy(strategy.id);
                router.push(`/strategies/${dup.id}`);
              })
            }
          >
            Duplicate
          </Button>
          {strategy.status !== 'archived' && strategy.status !== 'active' ? (
            <Button
              type="button"
              variant="destructive"
              loading={busy}
              onClick={() => {
                if (confirm(`Archive "${strategy.name}"?`)) {
                  runAction(() => api.archiveStrategy(strategy.id));
                }
              }}
            >
              Archive
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Overview">
            <dl className="flex flex-col gap-2 text-sm">
              {[
                ['Instrument', strategy.instrument],
                ['Exchange', strategy.exchange],
                ['Segment', strategy.segment],
                ['Timeframe', strategy.timeframe],
                ['Execution mode', strategy.executionMode],
                ['Current version', `v${strategy.currentVersion}`],
                ['Last validated', strategy.lastValidatedAt ? new Date(strategy.lastValidatedAt).toLocaleString() : 'Never'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-text-secondary">{label}</dt>
                  <dd className="font-medium capitalize text-text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Risk">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Capital allocated</dt>
                <dd className="font-medium text-text-primary">₹{strategy.riskConfig.capitalAllocated.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Max loss / day</dt>
                <dd className="font-medium text-text-primary">₹{strategy.riskConfig.maxLossPerDay.toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Max positions / trades per day</dt>
                <dd className="font-medium text-text-primary">
                  {strategy.riskConfig.maxPositions} / {strategy.riskConfig.maxTradesPerDay}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Stop loss / target</dt>
                <dd className="font-medium text-text-primary">
                  {strategy.riskConfig.stopLoss.value}
                  {strategy.riskConfig.stopLoss.type === 'percent' ? '%' : ' pts'} /{' '}
                  {strategy.riskConfig.target.value}
                  {strategy.riskConfig.target.type === 'percent' ? '%' : ' pts'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card title="Entry conditions">
          <JsonBlock value={strategy.entryConditions} />
        </Card>

        <Card title="Exit conditions">
          <JsonBlock value={strategy.exitConditions} />
        </Card>

        <Card title="Backtest">
          <StrategyBacktestSection strategyId={strategy.id} />
        </Card>

        <Card title="Version history">
          {!versions ? (
            <p className="text-sm text-text-secondary">Loading versions…</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {versions.map((v) => (
                <div key={v.id} className="py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setExpandedVersion(expandedVersion === v.version ? null : v.version)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        v{v.version} {v.version === strategy.currentVersion ? '(current)' : ''}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {new Date(v.createdAt).toLocaleString()}
                        {v.changeNote ? ` · ${v.changeNote}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-accent-trust">
                      {expandedVersion === v.version ? 'Hide' : 'View'}
                    </span>
                  </button>
                  {expandedVersion === v.version ? (
                    <div className="mt-3 flex flex-col gap-3">
                      <JsonBlock value={{ entry: v.entryConditions, exit: v.exitConditions, risk: v.riskConfig }} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}