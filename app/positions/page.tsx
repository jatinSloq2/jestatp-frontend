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
import { OrderSegment } from '@/lib/api';
import { usePositions } from '@/lib/queries/usePositions';
import { useSyncAndRefetch } from '@/lib/queries/useOrders';
import { queryKeys } from '@/lib/queries/queryKeys';

const SEGMENTS: (OrderSegment | 'all')[] = ['all', 'equity', 'fno', 'currency', 'commodity'];

function pnlClass(value: number) {
  if (value > 0) return 'text-pnl-positive';
  if (value < 0) return 'text-pnl-negative';
  return 'text-text-secondary';
}

function formatPnl(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function PositionsPage() {
  const { user } = useUser();
  const { connections, connectedBrokers, broker, setBroker, error: brokerError, loading: brokersLoading } = useConnectedBrokers();

  const [segment, setSegment] = useState<OrderSegment | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error } = usePositions({ broker, segment, page });
  const { sync, syncing } = useSyncAndRefetch(queryKeys.positions.list({ broker: broker!, segment, page }));

  const positions = data?.data ?? null;
  const meta = data?.meta ?? null;
  const totalPnl = positions?.reduce((sum, p) => sum + p.realizedPnl + p.unrealizedPnl, 0) ?? 0;

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
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Positions</h1>
          <p className="mt-1 text-base text-text-secondary">Open positions synced from your connected broker.</p>
        </div>

        {brokerError ? <Banner tone="negative">{brokerError}</Banner> : null}
        {error ? <Banner tone="negative">{error.message}</Banner> : null}

        {!brokersLoading && connectedBrokers.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">Connect a broker to see your positions here.</p>
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

            {positions && positions.length > 0 ? (
              <Card
                className={`flex items-center justify-between ${
                  totalPnl >= 0 ? 'border-pnl-positive/30 bg-pnl-positive/5' : 'border-pnl-negative/30 bg-pnl-negative/5'
                }`}
              >
                <span className="text-sm text-text-secondary">Total P&L (this page)</span>
                <span className={`font-mono text-lg font-semibold ${pnlClass(totalPnl)}`}>₹{formatPnl(totalPnl)}</span>
              </Card>
            ) : null}

            <Card className="overflow-x-auto">
              {isLoading || !positions ? (
                <p className="text-sm text-text-secondary">Loading positions…</p>
              ) : positions.length === 0 ? (
                <p className="text-sm text-text-secondary">No open positions.</p>
              ) : (
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-tertiary">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Qty</th>
                      <th className="pb-2 pr-4">Avg price</th>
                      <th className="pb-2 pr-4">LTP</th>
                      <th className="pb-2 pr-4">Realized</th>
                      <th className="pb-2">Unrealized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {positions.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">{p.tradingSymbol}</td>
                        <td className="py-2.5 pr-4 text-text-secondary">{p.productType}</td>
                        <td className={`py-2.5 pr-4 font-mono ${p.quantity < 0 ? 'text-pnl-negative' : 'text-text-secondary'}`}>
                          {p.quantity}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">{p.averagePrice}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">{p.lastTradedPrice ?? '—'}</td>
                        <td className={`py-2.5 pr-4 font-mono ${pnlClass(p.realizedPnl)}`}>{formatPnl(p.realizedPnl)}</td>
                        <td className={`py-2.5 font-mono ${pnlClass(p.unrealizedPnl)}`}>{formatPnl(p.unrealizedPnl)}</td>
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
