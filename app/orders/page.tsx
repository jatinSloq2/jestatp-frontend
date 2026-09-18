'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useUser } from '@/lib/useUser';
import { OrderRecord, OrderSegment } from '@/lib/api';
import { useOrders, useSyncAndRefetch } from '@/lib/queries/useOrders';
import { queryKeys } from '@/lib/queries/queryKeys';

const SEGMENTS: (OrderSegment | 'all')[] = ['all', 'equity', 'fno', 'currency', 'commodity'];

const statusTone: Record<OrderRecord['status'], string> = {
  CREATED: 'text-text-tertiary',
  VALIDATED: 'text-text-tertiary',
  SUBMITTED: 'text-risk-warning',
  OPEN: 'text-risk-warning',
  PARTIALLY_FILLED: 'text-risk-warning',
  FILLED: 'text-pnl-positive',
  CANCEL_REQUESTED: 'text-text-tertiary',
  CANCELLED: 'text-text-tertiary',
  REJECTED: 'text-pnl-negative',
};

export default function OrdersPage() {
  const { user } = useUser();
  const { connections, connectedBrokers, broker, setBroker, error: brokerError, loading: brokersLoading } = useConnectedBrokers();

  const [segment, setSegment] = useState<OrderSegment | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error } = useOrders({ broker, segment, page });
  const { sync, syncing } = useSyncAndRefetch(queryKeys.orders.list({ broker: broker!, segment, page }));

  const orders = data?.data ?? null;
  const meta = data?.meta ?? null;

  function handleSegmentChange(next: OrderSegment | 'all') {
    setSegment(next);
    setPage(1);
  }

  function handleBrokerChange(next: Parameters<typeof setBroker>[0]) {
    setBroker(next);
    setPage(1);
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Orders</h1>
          <p className="mt-1 text-base text-text-secondary">Your order book, synced from your connected broker.</p>
        </div>

        {brokerError ? <Banner tone="negative">{brokerError}</Banner> : null}
        {error ? <Banner tone="negative">{error.message}</Banner> : null}

        {!brokersLoading && connectedBrokers.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">Connect a broker to see your orders here.</p>
            <Link href="/brokers" className="mt-4 inline-block">
              <Button type="button">Connect a broker</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={handleBrokerChange} /> : null}
                <div className="flex gap-2">
                  {SEGMENTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSegmentChange(s)}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                        segment === s
                          ? 'border-accent-trust bg-accent-trust-soft text-accent-trust-strong'
                          : 'border-border-strong text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">
                  {meta?.lastSyncedAt ? `Synced ${new Date(meta.lastSyncedAt).toLocaleTimeString()}` : 'Never synced'}
                </span>
                <RefreshButton onClick={() => broker && sync(broker)} loading={isFetching} />
                <Button type="button" variant="secondary" size="md" loading={syncing} onClick={() => broker && sync(broker)}>
                  Sync now
                </Button>
              </div>
            </div>

            <Card className="overflow-x-auto">
              {isLoading || !orders ? (
                <p className="text-sm text-text-secondary">Loading orders…</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-text-secondary">No orders found.</p>
              ) : (
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-tertiary">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Side</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Qty (Filled)</th>
                      <th className="pb-2 pr-4">Price (Avg)</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Placed at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{o.tradingSymbol}</td>
                        <td className={`py-2.5 pr-4 font-medium ${o.side === 'BUY' ? 'text-pnl-positive' : 'text-pnl-negative'}`}>
                          {o.side}
                        </td>
                        <td className="py-2.5 pr-4 text-text-secondary">{o.orderType}</td>
                        <td className="py-2.5 pr-4 text-text-secondary">{o.productType}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {o.quantity} ({o.filledQuantity})
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {o.price ?? '—'} ({o.averagePrice ?? '—'})
                        </td>
                        <td className={`py-2.5 pr-4 font-medium ${statusTone[o.status]}`}>{o.status.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 text-text-tertiary">{o.placedAt ? new Date(o.placedAt).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {meta && meta.totalPages > 1 ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-tertiary">
                  Page {meta.page} of {meta.totalPages} · {meta.total} total
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="md" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button type="button" variant="secondary" size="md" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
