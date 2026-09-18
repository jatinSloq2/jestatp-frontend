'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useUser } from '@/lib/useUser';
import { useFunds } from '@/lib/queries/useFunds';
import { useSyncAndRefetch } from '@/lib/queries/useOrders';
import { queryKeys } from '@/lib/queries/queryKeys';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function FundsPage() {
  const { user } = useUser();
  const { connections, connectedBrokers, broker, setBroker, error: brokerError, loading: brokersLoading } = useConnectedBrokers();

  const { data: funds, isLoading, isFetching, error, refetch } = useFunds(broker);
  const { sync, syncing } = useSyncAndRefetch(queryKeys.funds.detail(broker!));

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Funds</h1>
          <p className="mt-1 text-base text-text-secondary">Available balance and margin, synced from your broker.</p>
        </div>

        {brokerError ? <Banner tone="negative">{brokerError}</Banner> : null}
        {error ? <Banner tone="negative">{error.message}</Banner> : null}

        {!brokersLoading && connectedBrokers.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">Connect a broker to see your funds here.</p>
            <Link href="/brokers" className="mt-4 inline-block">
              <Button type="button">Connect a broker</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} /> : null}
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">
                  {funds?.syncedAt ? `Synced ${new Date(funds.syncedAt).toLocaleTimeString()}` : 'Never synced'}
                </span>
                <RefreshButton onClick={() => refetch()} loading={isFetching} />
                <Button type="button" variant="secondary" size="md" loading={syncing} onClick={() => broker && sync(broker)}>
                  Sync now
                </Button>
              </div>
            </div>

            {isLoading || !funds ? (
              <p className="text-sm text-text-secondary">Loading funds…</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-accent-trust/30 bg-gradient-to-br from-accent-trust-soft via-surface to-surface">
                  <p className="text-sm text-text-secondary">Available balance</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-pnl-positive">{formatCurrency(funds.availableBalance)}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Used margin</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{formatCurrency(funds.usedMargin)}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Total balance</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{formatCurrency(funds.totalBalance)}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Collateral</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{formatCurrency(funds.collateral)}</p>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}