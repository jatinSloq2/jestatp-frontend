'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { Select } from '@/components/ui/select';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { PlaceOrderForm } from '@/components/trading/place-order-form';
import { useUser } from '@/lib/useUser';
import { INDEX_UNDERLYINGS, IndexUnderlying, OptionChainStrike, OptionLeg, PlaceOrderInput } from '@/lib/api';
import { useOptionChain, useOptionChainExpiries } from '@/lib/queries/useOptionChain';

function formatNumber(value: number, digits = 2) {
  return value.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function formatCompact(value: number) {
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

/** How far above/below the underlying's LTP the strike grid is trimmed to, so a 25,000-point NIFTY chain doesn't render 200 mostly-empty rows. */
const STRIKE_WINDOW = 20;

type TicketState = { leg: OptionLeg; side: 'BUY' | 'SELL' } | null;

export default function OptionsChainPage() {
  const { user } = useUser();
  const { connections, connectedBrokers, broker, setBroker, error: brokerError, loading: brokersLoading } = useConnectedBrokers();

  const [underlying, setUnderlying] = useState<IndexUnderlying>('NIFTY');
  const [expiry, setExpiry] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketState>(null);

  const expiriesQuery = useOptionChainExpiries(broker, underlying);
  const expiries = expiriesQuery.data ?? [];

  // Reset to the nearest expiry whenever the underlying changes or the
  // expiry list first loads, rather than silently carrying over a date that
  // may not exist for the newly-selected index.
  useEffect(() => {
    setExpiry(null);
  }, [underlying]);
  const effectiveExpiry = expiry ?? expiries[0] ?? null;

  const chainQuery = useOptionChain(broker, underlying, effectiveExpiry);
  const chain = chainQuery.data;

  const visibleStrikes = useMemo(() => {
    if (!chain) return [];
    const strikes = chain.strikes;
    if (!chain.underlyingLtp) return strikes;
    let atmIndex = 0;
    let closest = Infinity;
    strikes.forEach((s, i) => {
      const diff = Math.abs(s.strike - chain.underlyingLtp);
      if (diff < closest) {
        closest = diff;
        atmIndex = i;
      }
    });
    return strikes.slice(Math.max(0, atmIndex - STRIKE_WINDOW), atmIndex + STRIKE_WINDOW + 1);
  }, [chain]);

  const atmStrike = useMemo(() => {
    if (!chain || !chain.underlyingLtp) return null;
    return visibleStrikes.reduce<{ strike: number; diff: number } | null>((best, s) => {
      const diff = Math.abs(s.strike - chain.underlyingLtp);
      if (!best || diff < best.diff) return { strike: s.strike, diff };
      return best;
    }, null)?.strike;
  }, [chain, visibleStrikes]);

  const ticketInitial: Partial<Omit<PlaceOrderInput, 'broker'>> | undefined = ticket
    ? {
        tradingSymbol: ticket.leg.tradingSymbol ?? '',
        exchange: ticket.leg.exchange,
        segment: 'fno',
        side: ticket.side,
        productType: 'NRML',
        orderType: 'MARKET',
        quantity: ticket.leg.lotSize ?? 1,
      }
    : undefined;

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Options chain</h1>
          <p className="mt-1 text-base text-text-secondary">
            Live strikes for NIFTY, BANKNIFTY, FINNIFTY, MIDCPNIFTY and SENSEX — click a price to buy or sell that contract.
          </p>
        </div>

        {brokerError ? <Banner tone="negative">{brokerError}</Banner> : null}

        {!brokersLoading && connectedBrokers.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">Connect a broker to see live option chains here.</p>
            <Link href="/brokers" className="mt-4 inline-block">
              <Button type="button">Connect a broker</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              {connections ? <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} /> : null}

              <Select
                label="Index"
                hideLabel
                size="sm"
                triggerClassName="w-auto min-w-[9rem]"
                searchable={false}
                allowCustomValue={false}
                value={underlying}
                onChange={(v) => setUnderlying(v as IndexUnderlying)}
                options={INDEX_UNDERLYINGS.map((u) => ({ value: u, label: u }))}
              />

              <Select
                label="Expiry"
                hideLabel
                size="sm"
                triggerClassName="w-auto min-w-[9rem]"
                searchable={false}
                allowCustomValue={false}
                disabled={expiries.length === 0}
                value={effectiveExpiry ?? ''}
                onChange={(v) => setExpiry(v)}
                options={expiries.map((e) => ({ value: e, label: e }))}
              />

              {chain ? (
                <span className="flex items-center gap-1.5 rounded-full border border-pnl-positive/40 bg-pnl-positive/10 px-2.5 py-1 text-xs font-medium text-pnl-positive">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pnl-positive" />
                  Live · updates every 5s
                </span>
              ) : null}

              {chain ? (
                <span className="ml-auto font-mono text-sm text-text-secondary">
                  {chain.underlying} <span className="font-semibold text-text-primary">{formatNumber(chain.underlyingLtp)}</span>
                </span>
              ) : null}
            </div>

            {chainQuery.error ? (
              <Banner tone={chainQuery.error.status === 403 ? 'warning' : 'negative'}>{chainQuery.error.message}</Banner>
            ) : null}

            <Card className="overflow-x-auto p-0">
              {chainQuery.isLoading || !chain ? (
                <p className="p-4 text-sm text-text-secondary">Loading option chain…</p>
              ) : visibleStrikes.length === 0 ? (
                <p className="p-4 text-sm text-text-secondary">No strikes found for this expiry.</p>
              ) : (
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-center text-xs uppercase tracking-wide text-text-tertiary">
                      <th className="py-2 px-2" colSpan={5}>
                        Calls
                      </th>
                      <th className="py-2 px-2">Strike</th>
                      <th className="py-2 px-2" colSpan={5}>
                        Puts
                      </th>
                    </tr>
                    <tr className="border-b border-border text-center text-xs uppercase tracking-wide text-text-tertiary">
                      <th className="py-2 px-2">OI</th>
                      <th className="py-2 px-2">Vol</th>
                      <th className="py-2 px-2">Bid</th>
                      <th className="py-2 px-2">LTP</th>
                      <th className="py-2 px-2">Ask</th>
                      <th className="py-2 px-2">Price</th>
                      <th className="py-2 px-2">Bid</th>
                      <th className="py-2 px-2">LTP</th>
                      <th className="py-2 px-2">Ask</th>
                      <th className="py-2 px-2">Vol</th>
                      <th className="py-2 px-2">OI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleStrikes.map((row: OptionChainStrike) => {
                      const isAtm = row.strike === atmStrike;
                      return (
                        <tr key={row.strike} className={isAtm ? 'bg-accent-trust/5' : undefined}>
                          <OptionCells leg={row.call} onTrade={(side) => row.call && setTicket({ leg: row.call, side })} />
                          <td className={`py-2 px-2 text-center font-mono font-semibold ${isAtm ? 'text-accent-trust' : 'text-text-primary'}`}>
                            {formatNumber(row.strike, 0)}
                          </td>
                          <OptionCells leg={row.put} reversed onTrade={(side) => row.put && setTicket({ leg: row.put, side })} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        )}
      </div>

      {ticket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setTicket(null)}>
          <div className="w-full max-w-md rounded-lg border border-border-strong bg-surface-raised p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{ticket.leg.tradingSymbol ?? 'Unknown contract'}</h2>
                <p className="text-sm text-text-secondary">{ticket.leg.exchange} · LTP {formatNumber(ticket.leg.ltp)}</p>
              </div>
              <button type="button" onClick={() => setTicket(null)} className="text-text-tertiary hover:text-text-primary" aria-label="Close">
                ✕
              </button>
            </div>
            {!ticket.leg.tradingSymbol ? (
              <Banner tone="warning">
                This broker's option chain didn't return a resolvable trading symbol for this leg — order placement isn't available for
                it right now. Try a different strike/expiry, or place the order manually from the Orders page.
              </Banner>
            ) : broker ? (
              <PlaceOrderForm broker={broker} initial={ticketInitial} lockInstrument onPlaced={() => setTicket(null)} />
            ) : null}
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function OptionCells({ leg, reversed, onTrade }: { leg: OptionLeg | null; reversed?: boolean; onTrade: (side: 'BUY' | 'SELL') => void }) {
  if (!leg) {
    return (
      <>
        <td className="py-2 px-2 text-center text-text-tertiary" colSpan={5}>
          —
        </td>
      </>
    );
  }

  const priceCell = (
    <td className="py-2 px-2 text-center">
      <div className="flex justify-center gap-1">
        <button
          type="button"
          onClick={() => onTrade('BUY')}
          className="rounded bg-pnl-positive/10 px-2 py-1 font-mono text-xs font-semibold text-pnl-positive hover:bg-pnl-positive/20"
          title="Buy"
        >
          B {formatNumber(leg.ltp)}
        </button>
        <button
          type="button"
          onClick={() => onTrade('SELL')}
          className="rounded bg-risk-critical/10 px-2 py-1 font-mono text-xs font-semibold text-pnl-negative hover:bg-risk-critical/20"
          title="Sell"
        >
          S
        </button>
      </div>
    </td>
  );

  const dataCells = reversed ? (
    <>
      {priceCell}
      <td className="py-2 px-2 text-center font-mono text-text-secondary">{formatNumber(leg.bid)}</td>
      <td className="py-2 px-2 text-center font-mono font-medium text-text-primary">{formatNumber(leg.ltp)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-secondary">{formatNumber(leg.ask)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-tertiary">{formatCompact(leg.volume)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-tertiary">{formatCompact(leg.oi)}</td>
    </>
  ) : (
    <>
      <td className="py-2 px-2 text-center font-mono text-text-tertiary">{formatCompact(leg.oi)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-tertiary">{formatCompact(leg.volume)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-secondary">{formatNumber(leg.bid)}</td>
      <td className="py-2 px-2 text-center font-mono font-medium text-text-primary">{formatNumber(leg.ltp)}</td>
      <td className="py-2 px-2 text-center font-mono text-text-secondary">{formatNumber(leg.ask)}</td>
      {priceCell}
    </>
  );

  return dataCells;
}
