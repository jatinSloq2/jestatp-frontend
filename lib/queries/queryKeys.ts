import { BrokerName, OrderSegment, StrategyStatus, Segment } from '@/lib/api';

/**
 * One place for every query key used across the app. Using factories (not
 * hand-written arrays scattered per-hook) means invalidating "all orders for
 * a broker" vs. "this one page of orders" is unambiguous, and a typo in a
 * key can't silently create a second, never-invalidated cache entry.
 */
export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
    sessions: () => ['auth', 'sessions'] as const,
    twoFaStatus: () => ['auth', '2fa-status'] as const,
  },
  brokers: {
    supported: () => ['brokers', 'supported'] as const,
    connections: () => ['brokers', 'connections'] as const,
  },
  orders: {
    list: (params: { broker: BrokerName; segment?: OrderSegment | 'all'; page: number }) =>
      ['orders', params.broker, params.segment ?? 'all', params.page] as const,
  },
  positions: {
    list: (params: { broker: BrokerName; segment?: OrderSegment | 'all'; page: number }) =>
      ['positions', params.broker, params.segment ?? 'all', params.page] as const,
  },
  holdings: {
    list: (params: { broker: BrokerName; page: number }) => ['holdings', params.broker, params.page] as const,
  },
  funds: {
    detail: (broker: BrokerName) => ['funds', broker] as const,
  },
  strategies: {
    indicatorCatalog: () => ['strategies', 'indicator-catalog'] as const,
    list: (params?: { status?: StrategyStatus; segment?: Segment; page?: number; limit?: number }) =>
      ['strategies', 'list', params ?? {}] as const,
    detail: (id: string) => ['strategies', 'detail', id] as const,
    versions: (id: string) => ['strategies', 'detail', id, 'versions'] as const,
    version: (id: string, version: number) => ['strategies', 'detail', id, 'versions', version] as const,
  },
};
