'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useUser } from '@/lib/useUser';
import { api, ApiError, HoldingRecord, SyncedPaginationMeta } from '@/lib/api';
import { liveTickFor, useLiveTicks } from '@/lib/useLiveTicks';

function pnlClass(value: number) {
  if (value > 0) return 'text-pnl-positive';
  if (value < 0) return 'text-pnl-negative';
  return 'text-text-secondary';
}

function formatPnl(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function HoldingsPage() {
  const { user } = useUser();
  const { connections, connectedBrokers, broker, setBroker, error: brokerError, loading: brokersLoading } = useConnectedBrokers();

  const [page, setPage] = useState(1);
  const [holdings, setHoldings] = useState<HoldingRecord[] | null>(null);
  const [meta, setMeta] = useState<SyncedPaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    if (!broker) return;
    setLoading(true);
    setError(null);
    try {
      const { data, meta: m } = await api.listHoldings({ broker, page });
      setHoldings(data);
      setMeta(m);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load holdings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [broker]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker, page]);

  async function handleSync() {
    if (!broker) return;
    setSyncing(true);
    try {
      await api.syncBroker(broker);
      setTimeout(load, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not queue sync.');
    } finally {
      setSyncing(false);
    }
  }

  // Holdings are always equity/delivery — subscribe every row for a live LTP
  // the moment the synced list is in, so the page doesn't sit on
  // last-synced prices while the feed connects.
  const liveInstruments = (holdings ?? []).map((h) => ({ exchange: h.exchange, tradingSymbol: h.tradingSymbol, segment: 'equity' as const }));
  const liveTicks = useLiveTicks(broker, liveInstruments);

  function currentPrice(h: HoldingRecord): { price: number | null; isLive: boolean } {
    const live = liveTickFor(liveTicks, h.exchange, h.tradingSymbol);
    if (live) return { price: live.ltp, isLive: true };
    if (h.lastTradedPrice !== null) return { price: h.lastTradedPrice, isLive: false };
    return { price: null, isLive: false };
  }

  const rows = (holdings ?? []).map((h) => {
    const { price, isLive } = currentPrice(h);
    const currentValue = price !== null ? price * h.quantity : null;
    const investedValue = h.averagePrice * h.quantity;
    const pnl = currentValue !== null ? currentValue - investedValue : null;
    const pnlPercent = pnl !== null && investedValue !== 0 ? (pnl / investedValue) * 100 : null;
    return { holding: h, price, isLive, currentValue, investedValue, pnl, pnlPercent };
  });

  const totalInvested = rows.reduce((sum, r) => sum + r.investedValue, 0);
  const totalCurrent = rows.reduce((sum, r) => sum + (r.currentValue ?? r.investedValue), 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPercent = totalInvested !== 0 ? (totalPnl / totalInvested) * 100 : 0;
  const anyLive = rows.some((r) => r.isLive);

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Holdings</h1>
          <p className="mt-1 text-base text-text-secondary">
            Long-term equity holdings synced from your connected broker, with live prices where the market is open.
          </p>
        </div>

        {brokerError ? <Banner tone="negative">{brokerError}</Banner> : null}
        {error ? <Banner tone="negative">{error}</Banner> : null}

        {!brokersLoading && connectedBrokers.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">Connect a broker to see your holdings here.</p>
            <Link href="/brokers" className="mt-4 inline-block">
              <Button type="button">Connect a broker</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} /> : null}
                {anyLive ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-pnl-positive/40 bg-pnl-positive/10 px-2.5 py-1 text-xs font-medium text-pnl-positive">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pnl-positive" />
                    Live
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-tertiary">
                  {meta?.lastSyncedAt ? `Synced ${new Date(meta.lastSyncedAt).toLocaleTimeString()}` : 'Never synced'}
                </span>
                <RefreshButton onClick={load} loading={loading} />
                <Button type="button" variant="secondary" size="md" loading={syncing} onClick={handleSync}>
                  Sync now
                </Button>
              </div>
            </div>

            {holdings && holdings.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <span className="text-sm text-text-secondary">Invested value</span>
                  <p className="mt-1 font-mono text-lg font-semibold text-text-primary">₹{formatMoney(totalInvested)}</p>
                </Card>
                <Card>
                  <span className="text-sm text-text-secondary">Current value</span>
                  <p className="mt-1 font-mono text-lg font-semibold text-text-primary">₹{formatMoney(totalCurrent)}</p>
                </Card>
                <Card>
                  <span className="text-sm text-text-secondary">Total P&L</span>
                  <p className={`mt-1 font-mono text-lg font-semibold ${pnlClass(totalPnl)}`}>
                    ₹{formatPnl(totalPnl)}{' '}
                    <span className="text-sm font-normal">
                      ({totalPnlPercent > 0 ? '+' : ''}
                      {totalPnlPercent.toFixed(2)}%)
                    </span>
                  </p>
                </Card>
              </div>
            ) : null}

            <Card className="overflow-x-auto">
              {loading || !holdings ? (
                <p className="text-sm text-text-secondary">Loading holdings…</p>
              ) : holdings.length === 0 ? (
                <p className="text-sm text-text-secondary">No holdings found in your DEMAT account.</p>
              ) : (
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-tertiary">
                      <th className="pb-2 pr-4">Symbol</th>
                      <th className="pb-2 pr-4">Qty</th>
                      <th className="pb-2 pr-4">Avg price</th>
                      <th className="pb-2 pr-4">LTP</th>
                      <th className="pb-2 pr-4">Current value</th>
                      <th className="pb-2 pr-4">P&L</th>
                      <th className="pb-2">P&L %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map(({ holding: h, price, isLive, currentValue, pnl, pnlPercent }) => (
                      <tr key={h.id}>
                        <td className="py-2.5 pr-4 font-medium text-text-primary">
                          {h.tradingSymbol}
                          <span className="ml-1.5 text-xs font-normal text-text-tertiary">{h.exchange}</span>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">{h.quantity}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">{formatMoney(h.averagePrice)}</td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {price !== null ? (
                            <span className="inline-flex items-center gap-1.5">
                              {formatMoney(price)}
                              {isLive ? <span className="h-1.5 w-1.5 rounded-full bg-pnl-positive" title="Live price" /> : null}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-text-secondary">
                          {currentValue !== null ? formatMoney(currentValue) : '—'}
                        </td>
                        <td className={`py-2.5 pr-4 font-mono ${pnl !== null ? pnlClass(pnl) : 'text-text-secondary'}`}>
                          {pnl !== null ? formatPnl(pnl) : '—'}
                        </td>
                        <td className={`py-2.5 font-mono ${pnlPercent !== null ? pnlClass(pnlPercent) : 'text-text-secondary'}`}>
                          {pnlPercent !== null ? `${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(2)}%` : '—'}
                        </td>
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