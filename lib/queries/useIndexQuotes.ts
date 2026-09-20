import { useQuery } from '@tanstack/react-query';
import { api, BrokerName, Quote } from '@/lib/api';

export interface TickerRow {
  label: string;
  value: string;
  changePercent: string;
  up: boolean;
  /** false when this row is the static reference value (no broker connected, quote failed, or — for USD/INR — never attempted, see the note below) rather than a real live quote. */
  isLive: boolean;
}

interface IndexSpec {
  label: string;
  // null = never fetched live (see USD/INR below); otherwise the exact exchange:tradingSymbol
  // a broker's quote API expects. Same names work across Zerodha, Dhan (resolved through its
  // instrument master), and Groww's SDK — verified against each broker's official docs — with
  // a clean per-symbol fallback below if a particular broker doesn't recognize it.
  symbol: string | null;
  exchange: string | null;
  static: { value: string; change: string; changePercent: string; up: boolean };
}

const INDEX_SPECS: IndexSpec[] = [
  { label: 'NIFTY 50', symbol: 'NIFTY 50', exchange: 'NSE', static: { value: '24,812.35', change: '+58.85', changePercent: '+0.24%', up: true } },
  { label: 'SENSEX', symbol: 'SENSEX', exchange: 'BSE', static: { value: '81,244.10', change: '+222.73', changePercent: '+0.30%', up: true } },
  { label: 'BANK NIFTY', symbol: 'NIFTY BANK', exchange: 'NSE', static: { value: '52,006.80', change: '+253.05', changePercent: '+0.45%', up: true } },
  // USD/INR has no stable spot quote symbol on any of the three brokers —
  // it only trades as monthly-expiring currency futures contracts (e.g.
  // Zerodha's CDS:USDINR25DECFUT), whose exact tradingsymbol changes every
  // month. Rather than hardcode a contract code that silently goes stale,
  // this stays a clearly-labeled static reference value.
  { label: 'USD/INR', symbol: null, exchange: null, static: { value: '83.42', change: '-0.06', changePercent: '-0.07%', up: false } },
];

function useIndexQuote(broker: BrokerName | null, symbol: string | null, exchange: string | null) {
  return useQuery<Quote, Error>({
    queryKey: ['index-quote', broker, symbol, exchange],
    queryFn: () => api.getQuote(broker as BrokerName, symbol as string, exchange as string),
    enabled: broker !== null && symbol !== null,
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: false, // a wrong/unsupported symbol for this broker should fall back quietly, not hammer the API
  });
}

function toRow(spec: IndexSpec, quote: Quote | undefined): TickerRow {
  if (!quote || quote.close === undefined || quote.close === 0) {
    return { label: spec.label, value: spec.static.value, changePercent: spec.static.changePercent, up: spec.static.up, isLive: false };
  }
  const change = quote.ltp - quote.close;
  const changePercent = (change / quote.close) * 100;
  return {
    label: spec.label,
    value: quote.ltp.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
    changePercent: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
    up: change >= 0,
    isLive: true,
  };
}

/**
 * Merges live quotes (when a broker is connected and each symbol resolves)
 * with static reference values (otherwise) — every row always renders
 * something sensible, and `isLive` lets the UI be honest about which is which.
 */
export function useIndexTickerRows(broker: BrokerName | null): TickerRow[] {
  const q0 = useIndexQuote(broker, INDEX_SPECS[0].symbol, INDEX_SPECS[0].exchange);
  const q1 = useIndexQuote(broker, INDEX_SPECS[1].symbol, INDEX_SPECS[1].exchange);
  const q2 = useIndexQuote(broker, INDEX_SPECS[2].symbol, INDEX_SPECS[2].exchange);

  return [toRow(INDEX_SPECS[0], q0.data), toRow(INDEX_SPECS[1], q1.data), toRow(INDEX_SPECS[2], q2.data), toRow(INDEX_SPECS[3], undefined)];
}
