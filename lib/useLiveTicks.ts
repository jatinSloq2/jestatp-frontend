'use client';

import { useEffect, useRef, useState } from 'react';
import { BrokerName } from './api';

export type FeedSegment = 'equity' | 'fno' | 'currency' | 'commodity' | 'index';

export interface LiveInstrument {
  exchange: string;
  tradingSymbol: string;
  segment: FeedSegment;
}

export interface LiveTick {
  tradingSymbol: string;
  exchange: string;
  segment: FeedSegment;
  ltp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  openInterest?: number;
  timestamp: number;
}

function tickKey(exchange: string, tradingSymbol: string): string {
  return `${exchange}:${tradingSymbol}`;
}

/**
 * Derives the market-data WS origin from NEXT_PUBLIC_API_URL by stripping
 * the `/api/v1` REST prefix and swapping the scheme. The WS server is
 * mounted directly on the backend's HTTP server at `/ws/market-data`, not
 * under the REST API prefix — see jestatp-backend/src/server.ts.
 *
 * Auth: the WS handshake carries the httpOnly `accessToken` cookie
 * automatically, the same way the REST client's `credentials: 'include'`
 * fetch calls do — SameSite cookie rules key off registrable domain, not
 * port, so this works for a `localhost:3000` frontend talking to a
 * `localhost:5000` backend (and for same-registrable-domain production
 * setups) with no extra plumbing. A genuinely cross-site deployment
 * (different registrable domains) would need a short-lived ticket endpoint
 * instead — not needed for this app's current topology.
 */
function marketDataWsUrl(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  const origin = apiBase.replace(/\/api\/v[0-9]+\/?$/, '');
  const wsOrigin = origin.replace(/^http/, 'ws');
  return `${wsOrigin}/ws/market-data`;
}

/**
 * Subscribes to live ticks for `instruments` on `broker`, returning a map
 * keyed by "exchange:tradingSymbol" -> latest tick. Automatically
 * re-subscribes when the instrument set changes (e.g. once the holdings
 * list finishes loading) and cleans up the socket on unmount.
 *
 * Pass an empty `instruments` array (or `broker: null`) to skip connecting
 * entirely — e.g. while the underlying REST data is still loading.
 */
export function useLiveTicks(broker: BrokerName | null, instruments: LiveInstrument[]): Record<string, LiveTick> {
  const [ticks, setTicks] = useState<Record<string, LiveTick>>({});
  const instrumentsKey = instruments.map((i) => `${i.exchange}:${i.tradingSymbol}:${i.segment}`).join(',');

  useEffect(() => {
    if (!broker || instruments.length === 0) return undefined;

    let cancelled = false;
    const ws = new WebSocket(marketDataWsUrl());

    ws.onopen = () => {
      if (cancelled) return;
      ws.send(JSON.stringify({ action: 'subscribe', broker, instruments }));
    };

    ws.onmessage = (event) => {
      if (cancelled) return;
      let msg: { type?: string; tick?: LiveTick; message?: string };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return; // malformed frame — ignore rather than crash the UI
      }
      if (msg.type === 'tick' && msg.tick) {
        const tick = msg.tick;
        setTicks((prev) => ({ ...prev, [tickKey(tick.exchange, tick.tradingSymbol)]: tick }));
      }
      // msg.type === 'error' is intentionally not surfaced to the UI here —
      // a subscribe failure for one symbol (e.g. broker feed hiccup)
      // shouldn't block the rest of the page; the static synced price
      // still renders as a fallback.
    };

    return () => {
      cancelled = true;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
    // instrumentsKey intentionally substitutes for `instruments` in the dep
    // array — the array reference changes every render even when its
    // contents don't, which would otherwise reconnect the socket constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker, instrumentsKey]);

  return ticks;
}

export function liveTickFor(ticks: Record<string, LiveTick>, exchange: string, tradingSymbol: string): LiveTick | undefined {
  return ticks[tickKey(exchange, tradingSymbol)];
}