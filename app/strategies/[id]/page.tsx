'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { StrategyStatusBadge } from '@/components/ui/status-badge';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { StrategyBacktestSection } from '@/components/strategies/strategy-backtest-section';
import { LiveActivityPanel } from '@/components/strategies/live-activity-panel';
import { useUser } from '@/lib/useUser';
import { ApiError } from '@/lib/api';
import {
  useStrategy,
  useStrategyVersions,
  useStrategyActivity,
  useActivateStrategy,
  usePauseStrategy,
  useDuplicateStrategy,
  useArchiveStrategy,
} from '@/lib/queries/useStrategies';

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
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { confirm, dialog } = useConfirmDialog();

  const strategyQuery = useStrategy(params.id);
  const versionsQuery = useStrategyVersions(params.id);
  const strategy = strategyQuery.data ?? null;
  const versions = versionsQuery.data ?? null;
  const activityQuery = useStrategyActivity(params.id, undefined, strategy?.status === 'active');
  const activity = activityQuery.data ?? null;

  const activateMutation = useActivateStrategy();
  const pauseMutation = usePauseStrategy();
  const duplicateMutation = useDuplicateStrategy();
  const archiveMutation = useArchiveStrategy();

  const loadError =
    strategyQuery.error instanceof ApiError
      ? strategyQuery.error.message
      : versionsQuery.error instanceof ApiError
        ? versionsQuery.error.message
        : null;
  const error = loadError ?? actionError;
  const loading = strategyQuery.isFetching || versionsQuery.isFetching;

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  function refresh() {
    strategyQuery.refetch();
    versionsQuery.refetch();
  }

  if (!strategy) {
    return (
      <DashboardShell user={user}>
        {dialog}
        {error ? <Banner tone="negative">{error}</Banner> : <p className="text-text-secondary">Loading…</p>}
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      {dialog}
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
          <RefreshButton onClick={refresh} loading={loading} />
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        <div className="flex flex-wrap gap-2">
          {strategy.status === 'draft' || strategy.status === 'paused' ? (
            <Button type="button" loading={busy} onClick={() => runAction(() => activateMutation.mutateAsync(strategy.id))}>
              Activate
            </Button>
          ) : null}
          {strategy.status === 'active' ? (
            <Button type="button" variant="secondary" loading={busy} onClick={() => runAction(() => pauseMutation.mutateAsync(strategy.id))}>
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
                const dup = await duplicateMutation.mutateAsync(strategy.id);
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
              onClick={async () => {
                const ok = await confirm({
                  title: `Archive "${strategy.name}"?`,
                  confirmLabel: 'Archive',
                  tone: 'destructive',
                });
                if (ok) {
                  runAction(() => archiveMutation.mutateAsync(strategy.id));
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
                ['Broker', strategy.broker],
                ['Product type', strategy.productType],
                ['Language', strategy.language === 'python' ? 'Python' : 'Builder (no-code)'],
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

          {strategy.status === 'active' || strategy.status === 'paused' ? (
            <Card title="Live activity">
              {activity ? (
                <LiveActivityPanel activity={activity} />
              ) : (
                <p className="text-sm text-text-secondary">Loading…</p>
              )}
            </Card>
          ) : null}

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

        {strategy.language === 'python' ? (
          <Card title="Strategy code (Python)">
            <pre className="max-h-96 overflow-auto rounded border border-border-strong bg-surface-sunken p-3 font-mono text-xs text-text-secondary">
              {strategy.pythonCode}
            </pre>
          </Card>
        ) : (
          <>
            <Card title="Entry conditions">
              <JsonBlock value={strategy.entryConditions} />
            </Card>

            <Card title="Exit conditions">
              <JsonBlock value={strategy.exitConditions} />
            </Card>
          </>
        )}

        <Card title="Backtest">
          <StrategyBacktestSection strategyId={strategy.id} language={strategy.language} />
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
                      {v.language === 'python' ? (
                        <pre className="max-h-72 overflow-auto rounded border border-border-strong bg-surface-sunken p-3 font-mono text-xs text-text-secondary">
                          {v.pythonCode}
                        </pre>
                      ) : (
                        <JsonBlock value={{ entry: v.entryConditions, exit: v.exitConditions, risk: v.riskConfig }} />
                      )}
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