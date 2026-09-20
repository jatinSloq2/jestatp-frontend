const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

import {
  ExecutionMode,
  IndicatorCatalog,
  PaginationMeta,
  Strategy,
  StrategyInput,
  StrategyStatus,
  StrategyVersion,
  Segment,
  ValidationResult,
} from './strategy-types';

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * The backend sets a non-httpOnly `csrfToken` cookie alongside the session
 * cookies, and requires every cookie-authenticated non-GET request to echo
 * it back as an `x-csrf-token` header (double-submit CSRF check — see
 * requireAuth in the backend's auth.middleware.ts). Reading it here so every
 * mutating call below is authenticated correctly instead of hitting a 403.
 */
function readCsrfCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|; )csrfToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const csrfToken = method !== 'GET' ? readCsrfCookie() : undefined;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message ?? body?.error?.message ?? 'Something went wrong. Try again.';
    throw new ApiError(message, res.status, body?.data);
  }

  return body?.data ?? body;
}

/** Like `request`, but also returns the `meta` block some list endpoints attach (pagination). */
async function requestWithMeta<T, M>(path: string, init?: RequestInit): Promise<{ data: T; meta: M }> {
  const method = (init?.method ?? 'GET').toUpperCase();
  const csrfToken = method !== 'GET' ? readCsrfCookie() : undefined;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...init?.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.message ?? body?.error?.message ?? 'Something went wrong. Try again.';
    throw new ApiError(message, res.status, body?.data);
  }

  return { data: body?.data, meta: body?.meta };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  authProvider: 'local' | 'google';
  avatarUrl: string | null;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'totp' | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

export type BrokerName = 'dhan' | 'zerodha' | 'groww';
export type BrokerConnectionStatus = 'pending' | 'connected' | 'expired' | 'revoked' | 'error';

export interface SupportedBroker {
  broker: BrokerName;
  name: string;
  authType: 'token' | 'oauth';
}

export interface Quote {
  tradingSymbol: string;
  ltp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface BrokerConnection {
  id: string;
  userId: string;
  broker: BrokerName;
  clientId: string | null;
  tokenExpiresAt: string | null;
  status: BrokerConnectionStatus;
  lastSyncedAt: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export * from './strategy-types';

export type OrderSegment = 'equity' | 'fno' | 'currency' | 'commodity';

export interface OrderRecord {
  id: string;
  broker: BrokerName;
  brokerOrderId: string | null;
  exchange: string;
  segment: OrderSegment;
  tradingSymbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  productType: 'CNC' | 'MIS' | 'NRML';
  quantity: number;
  filledQuantity: number;
  price: number | null;
  averagePrice: number | null;
  status:
    | 'CREATED'
    | 'VALIDATED'
    | 'SUBMITTED'
    | 'OPEN'
    | 'PARTIALLY_FILLED'
    | 'FILLED'
    | 'CANCEL_REQUESTED'
    | 'CANCELLED'
    | 'REJECTED';
  placedAt: string | null;
}

/** Payload for POST /orders — see order.routes.ts's Joi schema for the price/triggerPrice-required-per-orderType rules. */
export interface PlaceOrderInput {
  broker: BrokerName;
  segment: OrderSegment;
  tradingSymbol: string;
  exchange: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  productType: 'CNC' | 'MIS' | 'NRML';
  quantity: number;
  price?: number;
  triggerPrice?: number;
}

export interface PositionRecord {
  id: string;
  broker: BrokerName;
  exchange: string;
  segment: OrderSegment;
  tradingSymbol: string;
  productType: string;
  quantity: number;
  averagePrice: number;
  lastTradedPrice: number | null;
  realizedPnl: number;
  unrealizedPnl: number;
}

export interface HoldingRecord {
  id: string;
  broker: BrokerName;
  exchange: string;
  tradingSymbol: string;
  isin: string | null;
  quantity: number;
  averagePrice: number;
  /** Last known price from the periodic broker sync — the holdings page overlays this with a live tick from /ws/market-data. */
  lastTradedPrice: number | null;
}

export interface FundRecord {
  id: string;
  broker: BrokerName;
  availableBalance: number;
  usedMargin: number;
  totalBalance: number;
  collateral: number;
  syncedAt: string;
}

// ─── Backtesting ───────────────────────────────────────────

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestTrade {
  entryIndex: number;
  exitIndex: number;
  entryTimestamp: number;
  exitTimestamp: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  exitReason: 'exit_condition' | 'stop_loss' | 'target' | 'trailing_stop_loss' | 'time_exit' | 'end_of_data';
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
}

export interface BacktestStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  totalPnl: number;
  totalReturnPercent: number;
  maxDrawdownPercent: number;
  profitFactor: number | null;
  averagePnlPerTrade: number;
  bestTrade: number;
  worstTrade: number;
}

export interface OpenPositionSnapshot {
  entryIndex: number;
  entryTimestamp: number;
  entryPrice: number;
  quantity: number;
  stopLossPrice: number;
  targetPrice: number;
  trailingStopPrice: number | null;
}

export interface BacktestResult {
  strategyId: string;
  broker: BrokerName;
  timeframe: string;
  instrument: string;
  exchange: string;
  from: string;
  to: string;
  candles: Candle[];
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  stats: BacktestStats;
  // Always null for a backtest (the engine force-closes on the last bar) —
  // present on the shared type because the live engine's runtime reuses it.
  openPosition: OpenPositionSnapshot | null;
  // Python strategies only: whatever the script passed to ctx.log(...).
  logs?: string[];
}

/** The engine's persisted "what am I doing right now" snapshot — see liveEngine.ts / StrategyRuntimeState. */
export interface PersistedOpenPosition extends OpenPositionSnapshot {
  tradeId: string;
  entryOrderId: string | null;
}

export interface StrategyTradeRecord {
  id: string;
  strategyId: string;
  mode: 'paper' | 'live';
  entryTimestamp: number;
  entryPrice: number;
  exitTimestamp: number | null;
  exitPrice: number | null;
  quantity: number;
  exitReason: BacktestTrade['exitReason'] | null;
  pnl: number | null;
  entryOrderId: string | null;
  exitOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyActivity {
  status: StrategyStatus;
  executionMode: ExecutionMode;
  broker: BrokerName;
  runtime: {
    lastProcessedBarTimestamp: number | null;
    openPosition: PersistedOpenPosition | null;
    tradesToday: number;
    lossToday: number;
  } | null;
  summary: {
    closedTrades: number;
    openPosition: number;
    winningTrades: number;
    losingTrades: number;
    winRatePercent: number;
    totalPnl: number;
    bestTrade: number;
    worstTrade: number;
  };
  trades: {
    rows: StrategyTradeRecord[];
    meta: PaginationMeta;
  };
}

/** Something the live trading engine raised that a human should see — see alerting.service.ts. */
export interface AlertRecord {
  id: string;
  userId: string;
  strategyId: string | null;
  severity: 'info' | 'warning' | 'critical';
  type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  acknowledgedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertsPaginationMeta extends PaginationMeta {
  unacknowledgedCount: number;
}


/** The pagination meta these two endpoints return, plus the broker connection's lastSyncedAt. */
export interface SyncedPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  lastSyncedAt: string | null;
}

export const api = {
  register: (input: { fullName: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(input) }),

  verifyEmail: (input: { email: string; code: string }) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify(input) }),

  resendVerification: (input: { email: string }) =>
    request('/auth/resend-verification', { method: 'POST', body: JSON.stringify(input) }),

  login: (input: { email: string; password: string }) =>
    request<{
      status: 'verified' | 'requires_email_verification' | 'requires_2fa';
      email?: string;
      method?: 'email' | 'totp';
    }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),

  verifyLogin2fa: (input: { code: string }) =>
    request<{ user: User }>('/auth/login/2fa/verify', { method: 'POST', body: JSON.stringify(input) }),

  resendLogin2fa: () => request('/auth/login/2fa/resend', { method: 'POST' }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  logoutAll: () => request<{ message: string }>('/auth/logout-all', { method: 'POST' }),

  me: () => request<User>('/auth/me'),

  sessions: () => request<Session[]>('/auth/sessions'),

  twoFaStatus: () => request<{ enabled: boolean; method: 'email' | 'totp' | null }>('/auth/2fa/status'),

  totpSetup: () =>
    request<{ secret: string; keyUri: string; qrCodeDataUrl: string }>('/auth/2fa/totp/setup', { method: 'POST' }),

  totpEnable: (input: { code: string }) =>
    request<{ enabled: true; method: 'totp' }>('/auth/2fa/totp/enable', { method: 'POST', body: JSON.stringify(input) }),

  emailTwoFaSetup: () => request<{ message: string }>('/auth/2fa/email/setup', { method: 'POST' }),

  emailTwoFaEnable: (input: { code: string }) =>
    request<{ enabled: true; method: 'email' }>('/auth/2fa/email/enable', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  disable2fa: (input: { password?: string }) =>
    request<{ enabled: false }>('/auth/2fa/disable', { method: 'POST', body: JSON.stringify(input) }),

  getProfile: () => request<User>('/users/me'),

  updateProfile: (input: { fullName: string }) =>
    request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(input) }),

  // ─── Brokers ───────────────────────────────────────────────
  listSupportedBrokers: () => request<SupportedBroker[]>('/brokers'),

  listBrokerConnections: () => request<BrokerConnection[]>('/brokers/connections'),

  connectDhan: (input: { clientId: string; accessToken: string }) =>
    request<BrokerConnection>('/brokers/dhan/connect', { method: 'POST', body: JSON.stringify(input) }),

  zerodhaLoginUrl: (input: { apiKey: string }) =>
    request<{ loginUrl: string }>('/brokers/zerodha/login-url', { method: 'POST', body: JSON.stringify(input) }),

  connectZerodha: (input: { apiKey: string; apiSecret: string; requestToken: string }) =>
    request<BrokerConnection>('/brokers/zerodha/connect', { method: 'POST', body: JSON.stringify(input) }),

  connectGroww: (input: { apiKey: string; apiSecret: string }) =>
    request<BrokerConnection>('/brokers/groww/connect', { method: 'POST', body: JSON.stringify(input) }),

  disconnectBroker: (broker: BrokerName) =>
    request<BrokerConnection>(`/brokers/${broker}`, { method: 'DELETE' }),

  syncBroker: (broker: BrokerName) =>
    request<{ jobId: string }>(`/brokers/${broker}/sync`, { method: 'POST' }),

  // ─── Strategies ────────────────────────────────────────────
  getIndicatorCatalog: () => request<IndicatorCatalog>('/strategies/meta/indicators'),

  validateStrategy: (input: StrategyInput) =>
    request<ValidationResult>('/strategies/validate', { method: 'POST', body: JSON.stringify(input) }).catch(
      (err) => {
        // The backend returns 422 (non-2xx) with the same {valid, issues} shape on failure —
        // surface it as a normal result instead of throwing, since 422 here isn't an app error.
        if (err instanceof ApiError && err.status === 422 && err.data) return err.data as ValidationResult;
        throw err;
      },
    ),

  createStrategy: (input: StrategyInput) =>
    request<Strategy>('/strategies', { method: 'POST', body: JSON.stringify(input) }),

  listStrategies: (params?: { status?: StrategyStatus; segment?: Segment; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.segment) qs.set('segment', params.segment);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return requestWithMeta<Strategy[], PaginationMeta>(`/strategies${query ? `?${query}` : ''}`);
  },

  getStrategy: (id: string) => request<Strategy>(`/strategies/${id}`),

  updateStrategy: (id: string, input: Partial<StrategyInput>) =>
    request<Strategy>(`/strategies/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  activateStrategy: (id: string) => request<Strategy>(`/strategies/${id}/activate`, { method: 'POST' }),

  pauseStrategy: (id: string) => request<Strategy>(`/strategies/${id}/pause`, { method: 'POST' }),

  archiveStrategy: (id: string) => request<{ archived: boolean }>(`/strategies/${id}`, { method: 'DELETE' }),

  duplicateStrategy: (id: string) => request<Strategy>(`/strategies/${id}/duplicate`, { method: 'POST' }),

  listStrategyVersions: (id: string) => request<StrategyVersion[]>(`/strategies/${id}/versions`),

  getStrategyActivity: (id: string, params?: { page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<StrategyActivity>(`/strategies/${id}/activity${suffix}`);
  },

  getStrategyVersion: (id: string, version: number) =>
    request<StrategyVersion>(`/strategies/${id}/versions/${version}`),

  runBacktest: (id: string, input: { broker?: BrokerName; from?: string; to?: string; params?: Record<string, unknown>; warmup?: number }) =>
    request<BacktestResult>(`/strategies/${id}/backtest`, { method: 'POST', body: JSON.stringify(input) }),

  previewBacktest: (
    input: Pick<StrategyInput, 'instrument' | 'exchange' | 'segment' | 'timeframe' | 'language' | 'entry' | 'exit' | 'pythonCode' | 'risk'> & {
      broker: BrokerName;
      from?: string;
      to?: string;
      params?: Record<string, unknown>;
      warmup?: number;
    },
  ) => request<BacktestResult>('/strategies/backtest/preview', { method: 'POST', body: JSON.stringify(input) }),

  // ─── Trading data (orders / positions / funds) ────────────
  listOrders: (params: { broker: BrokerName; segment?: OrderSegment; page?: number; limit?: number }) => {
    const qs = new URLSearchParams({ broker: params.broker });
    if (params.segment) qs.set('segment', params.segment);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return requestWithMeta<OrderRecord[], SyncedPaginationMeta>(`/orders?${qs.toString()}`);
  },

  /** Places a real order with the broker — see order.routes.ts's POST /orders for validation rules (price/triggerPrice required depending on orderType). */
  placeOrder: (input: PlaceOrderInput) => request<OrderRecord>('/orders', { method: 'POST', body: JSON.stringify(input) }),

  listPositions: (params: { broker: BrokerName; segment?: OrderSegment; page?: number; limit?: number }) => {
    const qs = new URLSearchParams({ broker: params.broker });
    if (params.segment) qs.set('segment', params.segment);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return requestWithMeta<PositionRecord[], SyncedPaginationMeta>(`/positions?${qs.toString()}`);
  },

  listHoldings: (params: { broker: BrokerName; page?: number; limit?: number }) => {
    const qs = new URLSearchParams({ broker: params.broker });
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    return requestWithMeta<HoldingRecord[], SyncedPaginationMeta>(`/holdings?${qs.toString()}`);
  },

  getFunds: (broker: BrokerName) => request<FundRecord>(`/funds?broker=${broker}`),

  /** One-off LTP/OHLC lookup — see broker.routes.ts's GET /brokers/:broker/quote. Throws (ApiError) on no connection, session expired, or missing data plan — callers fetching multiple symbols should catch per-symbol rather than let one bad quote break the rest. */
  getQuote: (broker: BrokerName, symbol: string, exchange?: string) => {
    const qs = new URLSearchParams({ symbol });
    if (exchange) qs.set('exchange', exchange);
    return request<Quote>(`/brokers/${broker}/quote?${qs.toString()}`);
  },

  forgotPassword: (input: { email: string }) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(input) }),

  resetPassword: (input: { token: string; password: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(input) }),

  // ─── Alerts ────────────
  listAlerts: (params?: { unacknowledged?: boolean; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.unacknowledged) qs.set('unacknowledged', 'true');
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return requestWithMeta<AlertRecord[], AlertsPaginationMeta>(`/alerts${suffix}`);
  },

  acknowledgeAlert: (id: string) => request<AlertRecord>(`/alerts/${id}/acknowledge`, { method: 'POST' }),
};