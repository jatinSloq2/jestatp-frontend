'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Banner } from '@/components/ui/banner';
import { RefreshButton } from '@/components/ui/refresh-button';
import { Button } from '@/components/ui/button';
import { StrategyStatusBadge } from '@/components/ui/status-badge';
import { useConnectedBrokers } from '@/components/trading/broker-picker';
import { useUser } from '@/lib/useUser';
import { useFunds } from '@/lib/queries/useFunds';
import { useHoldings } from '@/lib/queries/useHoldings';
import { usePositions } from '@/lib/queries/usePositions';
import { useOrders } from '@/lib/queries/useOrders';
import { useStrategies } from '@/lib/queries/useStrategies';
import { formatCurrency, formatPnl, formatPnlPercent, pnlClass, relativeTime } from '@/lib/format';

const modules = [
  {
    title: 'Brokers',
    description: 'Connect and manage broker accounts.',
    href: '/brokers',
    icon: (
      <path d="M4 10L12 4L20 10V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V10Z" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Orders',
    description: 'Your order book, synced live.',
    href: '/orders',
    icon: <path d="M6 4H18V20L15 18L12 20L9 18L6 20V4Z" strokeWidth="1.6" strokeLinejoin="round" />,
  },
  {
    title: 'Positions',
    description: 'Open positions with real-time P&L.',
    href: '/positions',
    icon: <path d="M4 18L9 11L13 14L20 6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Funds',
    description: 'Available balance and margin.',
    href: '/funds',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
        <path d="M12 8V16M9.5 10.2C9.5 9 10.6 8.3 12 8.3C13.4 8.3 14.5 9 14.5 10.1C14.5 12.3 9.5 11.7 9.5 13.9C9.5 15 10.6 15.7 12 15.7C13.4 15.7 14.5 15 14.5 13.8" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
];

function StatTile({
  label,
  value,
  valueClassName,
  sub,
  subClassName,
  loading,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  sub?: string;
  subClassName?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <p className="text-sm text-text-secondary">{label}</p>
      {loading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded bg-surface-raised" />
      ) : (
        <p className={`mt-1.5 font-mono text-xl font-semibold tabular ${valueClassName ?? 'text-text-primary'}`}>{value}</p>
      )}
      {sub ? <p className={`mt-1 text-xs ${subClassName ?? 'text-text-tertiary'}`}>{sub}</p> : null}
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading, error, refresh } = useUser();
  const { broker, connectedBrokers, loading: brokersLoading } = useConnectedBrokers();

  const fundsQuery = useFunds(broker);
  const holdingsQuery = useHoldings({ broker, page: 1, limit: 100 });
  const positionsQuery = usePositions({ broker, segment: 'all', page: 1, limit: 100 });
  const recentOrdersQuery = useOrders({ broker, segment: 'all', page: 1, limit: 5 });
  const strategiesQuery = useStrategies({ limit: 100 });

  if (loading) {
    return (
      <DashboardShell user={null}>
        <p className="text-text-secondary">Loading your account…</p>
      </DashboardShell>
    );
  }

  const hasBroker = broker !== null && connectedBrokers.length > 0;

  const holdings = holdingsQuery.data?.data ?? [];
  const holdingsRows = holdings.map((h) => {
    const price = h.lastTradedPrice ?? h.averagePrice;
    const currentValue = price * h.quantity;
    const investedValue = h.averagePrice * h.quantity;
    return { currentValue, investedValue };
  });
  const totalInvested = holdingsRows.reduce((sum, r) => sum + r.investedValue, 0);
  const totalCurrent = holdingsRows.reduce((sum, r) => sum + r.currentValue, 0);
  const holdingsPnl = totalCurrent - totalInvested;
  const holdingsPnlPercent = totalInvested !== 0 ? (holdingsPnl / totalInvested) * 100 : 0;

  const positions = positionsQuery.data?.data ?? [];
  const positionsPnl = positions.reduce((sum, p) => sum + p.realizedPnl + p.unrealizedPnl, 0);
  const openPositionsCount = positionsQuery.data?.meta.total ?? positions.length;

  const strategies = strategiesQuery.data?.data ?? [];
  const activeStrategiesCount = strategies.filter((s) => s.status === 'active').length;
  const totalStrategiesCount = strategiesQuery.data?.meta.total ?? strategies.length;

  const recentOrders = recentOrdersQuery.data?.data ?? [];

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-gradient-to-br from-accent-trust-soft via-surface to-surface p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
            </h1>
            <p className="mt-1 text-base text-text-secondary">Here&rsquo;s where things stand on your account.</p>
          </div>
          <RefreshButton onClick={refresh} loading={loading} />
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        {!brokersLoading && !hasBroker ? (
          <Banner tone="neutral">
            Connect a broker to see your portfolio value, open positions, and recent trades here.{' '}
            <Link href="/brokers" className="font-medium text-accent-trust hover:text-accent-trust-strong">
              Connect now →
            </Link>
          </Banner>
        ) : null}

        {hasBroker ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Portfolio value"
              value={formatCurrency(totalCurrent)}
              loading={holdingsQuery.isLoading}
              sub={holdings.length > 0 ? `${formatPnl(holdingsPnl)} (${formatPnlPercent(holdingsPnlPercent)})` : 'No holdings yet'}
              subClassName={holdings.length > 0 ? pnlClass(holdingsPnl) : 'text-text-tertiary'}
            />
            <StatTile
              label="Available balance"
              value={fundsQuery.data ? formatCurrency(fundsQuery.data.availableBalance) : '—'}
              loading={fundsQuery.isLoading}
              sub={fundsQuery.data ? `${formatCurrency(fundsQuery.data.usedMargin)} used margin` : undefined}
            />
            <StatTile
              label="Open positions"
              value={String(openPositionsCount)}
              loading={positionsQuery.isLoading}
              sub={positions.length > 0 ? `${formatPnl(positionsPnl)} unrealized + realized` : 'No open positions'}
              subClassName={positions.length > 0 ? pnlClass(positionsPnl) : 'text-text-tertiary'}
            />
            <StatTile
              label="Active strategies"
              value={String(activeStrategiesCount)}
              loading={strategiesQuery.isLoading}
              sub={`${totalStrategiesCount} total`}
            />
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card
            title="Recent trades"
            className="lg:col-span-2"
            description={hasBroker ? undefined : 'Connect a broker to see your order activity here.'}
          >
            {!hasBroker ? null : recentOrdersQuery.isLoading ? (
              <p className="text-sm text-text-secondary">Loading recent trades…</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-text-secondary">No orders placed yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          o.side === 'BUY'
                            ? 'border-pnl-positive/30 bg-pnl-positive/10 text-pnl-positive'
                            : 'border-risk-critical/30 bg-risk-critical/10 text-pnl-negative'
                        }`}
                      >
                        {o.side}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{o.tradingSymbol}</p>
                        <p className="text-xs text-text-tertiary">
                          {o.quantity} qty · {o.productType} · {relativeTime(o.placedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-text-primary">{o.averagePrice ?? o.price ?? '—'}</p>
                      <p className="text-xs text-text-tertiary">{o.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {hasBroker && recentOrders.length > 0 ? (
              <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
                View all orders →
              </Link>
            ) : null}
          </Card>

          <Card title="Strategies">
            {strategiesQuery.isLoading ? (
              <p className="text-sm text-text-secondary">Loading…</p>
            ) : strategies.length === 0 ? (
              <>
                <p className="text-sm text-text-secondary">You haven&rsquo;t built a strategy yet.</p>
                <Link href="/strategies/new" className="mt-4 inline-block">
                  <Button type="button" className="w-full">
                    New strategy
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {strategies.slice(0, 4).map((s) => (
                  <Link
                    key={s.id}
                    href={`/strategies/${s.id}`}
                    className="flex items-center justify-between gap-2 rounded px-1 py-1 hover:bg-surface-raised"
                  >
                    <span className="truncate text-sm font-medium text-text-primary">{s.name}</span>
                    <StrategyStatusBadge status={s.status} />
                  </Link>
                ))}
                <Link href="/strategies" className="mt-1 text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
                  View all strategies →
                </Link>
              </div>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Trading</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="group rounded-lg border border-border bg-surface p-4 shadow-panel transition-colors hover:border-accent-trust"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-trust-soft text-accent-trust-strong">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {mod.icon}
                  </svg>
                </span>
                <p className="mt-3 font-medium text-text-primary group-hover:text-accent-trust-strong">{mod.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{mod.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
