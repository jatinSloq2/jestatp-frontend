// Mirrors jestatp-backend/src/modules/strategies/dsl/{types,constants}.ts.
// Keep in sync if the backend DSL changes.

export const INDICATOR_NAMES = [
  'SMA',
  'EMA',
  'VWAP',
  'RSI',
  'MACD',
  'BBANDS',
  'SUPERTREND',
  'ATR',
  'ADX',
  'STOCHASTIC',
] as const;
export type IndicatorName = (typeof INDICATOR_NAMES)[number];

export const COMPARISON_OPERATORS = ['>', '<', '>=', '<=', '==', '!=', 'between'] as const;
export const CROSS_OPERATORS = ['cross_above', 'cross_below'] as const;
export const ALL_OPERATORS = [...COMPARISON_OPERATORS, ...CROSS_OPERATORS] as const;
export type Operator = (typeof ALL_OPERATORS)[number];

export const CANDLE_PATTERNS = [
  'bullish_engulfing',
  'bearish_engulfing',
  'hammer',
  'inverted_hammer',
  'hanging_man',
  'shooting_star',
  'doji',
  'morning_star',
  'evening_star',
  'three_white_soldiers',
  'three_black_crows',
  'marubozu',
  'spinning_top',
  'piercing_line',
  'dark_cloud_cover',
] as const;
export type CandlePattern = (typeof CANDLE_PATTERNS)[number];

export const MARKET_CONDITIONS = [
  'trending_up',
  'trending_down',
  'sideways',
  'high_volatility',
  'low_volatility',
  'above_vwap',
  'below_vwap',
  'gap_up',
  'gap_down',
] as const;
export type MarketCondition = (typeof MARKET_CONDITIONS)[number];

export const PRICE_FIELDS = ['open', 'high', 'low', 'close'] as const;
export type PriceField = (typeof PRICE_FIELDS)[number];

export const BREAKOUT_LEVELS = ['high', 'low', 'resistance', 'support'] as const;
export type BreakoutLevel = (typeof BREAKOUT_LEVELS)[number];

export const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '1d'] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const POSITION_SIZING_METHODS = ['fixed_quantity', 'fixed_capital', 'percent_of_capital'] as const;
export type PositionSizingMethod = (typeof POSITION_SIZING_METHODS)[number];

export const STOP_LOSS_TARGET_TYPES = ['percent', 'points'] as const;
export type StopLossTargetType = (typeof STOP_LOSS_TARGET_TYPES)[number];

export const STRATEGY_STATUSES = ['draft', 'active', 'paused', 'archived'] as const;
export type StrategyStatus = (typeof STRATEGY_STATUSES)[number];

export const EXECUTION_MODES = ['paper', 'live'] as const;
export type ExecutionMode = (typeof EXECUTION_MODES)[number];

export const SEGMENTS = ['equity', 'fno', 'currency', 'commodity'] as const;
export type Segment = (typeof SEGMENTS)[number];

export interface IndicatorParamSpec {
  name: string;
  type: 'integer' | 'float';
  min: number;
  max: number;
  default: number;
}

export interface IndicatorCatalogEntry {
  name: IndicatorName;
  description: string;
  params: IndicatorParamSpec[];
}

export interface IndicatorCatalog {
  indicators: IndicatorCatalogEntry[];
  operators: readonly Operator[];
  candlePatterns: readonly CandlePattern[];
  marketConditions: readonly MarketCondition[];
  breakoutLevels: readonly BreakoutLevel[];
  timeframes: readonly Timeframe[];
  positionSizingMethods: readonly PositionSizingMethod[];
  stopLossTargetTypes: readonly StopLossTargetType[];
}

export interface IndicatorRef {
  indicator: IndicatorName;
  params?: Record<string, number>;
}

export type ConditionOperand = number | [number, number] | IndicatorRef;

export interface IndicatorCondition {
  type: 'indicator';
  indicator: IndicatorName;
  params?: Record<string, number>;
  operator: Operator;
  value: ConditionOperand;
}

export interface CandlePatternCondition {
  type: 'candle_pattern';
  pattern: CandlePattern;
  lookback?: number;
}

export interface PriceActionCondition {
  type: 'price_action';
  field: PriceField;
  operator: Operator;
  value: ConditionOperand;
}

export interface VolumeCondition {
  type: 'volume';
  operator: Operator;
  compareTo: number | { type: 'average_volume'; period: number };
}

export interface BreakoutCondition {
  type: 'breakout';
  level: BreakoutLevel;
  lookbackPeriod: number;
  bufferPercent?: number;
}

export interface SupportResistanceCondition {
  type: 'support_resistance';
  level: 'support' | 'resistance';
  proximityPercent: number;
}

export interface TimeCondition {
  type: 'time';
  operator: 'before' | 'after' | 'between';
  value: string | [string, string];
}

export interface MarketConditionCondition {
  type: 'market_condition';
  condition: MarketCondition;
}

export interface CustomFormulaCondition {
  type: 'custom_formula';
  formula: string;
}

export type LeafCondition =
  | IndicatorCondition
  | CandlePatternCondition
  | PriceActionCondition
  | VolumeCondition
  | BreakoutCondition
  | SupportResistanceCondition
  | TimeCondition
  | MarketConditionCondition
  | CustomFormulaCondition;

export interface GroupCondition {
  type: 'group';
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

export type Condition = LeafCondition | GroupCondition;

export interface ConditionBlock {
  conditions: Condition[];
  logic?: 'AND' | 'OR';
}

export interface StopLossConfig {
  type: StopLossTargetType;
  value: number;
}

export interface TargetConfig {
  type: StopLossTargetType;
  value: number;
}

export interface TrailingStopLossConfig {
  enabled: boolean;
  type: StopLossTargetType;
  value: number;
}

export interface TimeBasedExitConfig {
  enabled: boolean;
  exitTime: string;
}

export interface PositionSizingConfig {
  method: PositionSizingMethod;
  value: number;
}

export interface RiskConfig {
  capitalAllocated: number;
  maxLossPerDay: number;
  maxPositions: number;
  maxTradesPerDay: number;
  positionSizing: PositionSizingConfig;
  stopLoss: StopLossConfig;
  target: TargetConfig;
  trailingStopLoss?: TrailingStopLossConfig;
  timeBasedExit?: TimeBasedExitConfig;
}

/** The payload sent to POST/PATCH /strategies and /strategies/validate. */
export interface StrategyInput {
  name: string;
  description?: string | null;
  instrument: string;
  exchange: string;
  segment?: Segment;
  timeframe: Timeframe;
  executionMode?: ExecutionMode;
  entry: ConditionBlock;
  exit: ConditionBlock;
  risk: RiskConfig;
  changeNote?: string;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  instrument: string;
  exchange: string;
  segment: Segment;
  timeframe: Timeframe;
  status: StrategyStatus;
  executionMode: ExecutionMode;
  currentVersion: number;
  entryConditions: ConditionBlock;
  exitConditions: ConditionBlock;
  riskConfig: RiskConfig;
  lastValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyVersion {
  id: string;
  strategyId: string;
  version: number;
  name: string;
  entryConditions: ConditionBlock;
  exitConditions: ConditionBlock;
  riskConfig: RiskConfig;
  changeNote: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}