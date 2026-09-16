'use client';

import { BacktestResult } from '@/lib/api';

const MAX_DISPLAY_CANDLES = 150;

export function BacktestChart({ result }: { result: BacktestResult }) {
  const width = 720;
  const priceHeight = 220;
  const equityHeight = 64;
  const padding = { top: 16, bottom: 16, left: 8, right: 8 };

  // A long date range can return thousands of intraday candles — render only
  // the most recent window so the SVG stays legible and light, and say so.
  const startIndex = Math.max(0, result.candles.length - MAX_DISPLAY_CANDLES);
  const candles = result.candles.slice(startIndex);
  const trimmed = startIndex > 0;

  if (candles.length === 0) {
    return <p className="text-sm text-text-secondary">No candles to display.</p>;
  }

  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const range = Math.max(max - min, 1e-6);
  const chartH = priceHeight - padding.top - padding.bottom;
  const slotW = (width - padding.left - padding.right) / candles.length;
  const candleW = Math.max(slotW * 0.55, 1.5);

  function y(v: number) {
    return padding.top + chartH - ((v - min) / range) * chartH;
  }
  function x(i: number) {
    return padding.left + i * slotW + slotW / 2;
  }

  const equityValues = result.equityCurve.map((e) => e.equity);
  const eqMin = Math.min(...equityValues, result.equityCurve[0]?.equity ?? 0);
  const eqMax = Math.max(...equityValues, result.equityCurve[0]?.equity ?? 0);
  const eqRange = Math.max(eqMax - eqMin, 1e-6);
  function eqY(v: number) {
    return equityHeight - ((v - eqMin) / eqRange) * equityHeight;
  }

  const displayedTrades = result.trades.filter(
    (t) => t.entryIndex >= startIndex || t.exitIndex >= startIndex,
  );

  return (
    <div className="flex flex-col gap-3">
      <svg viewBox={`0 0 ${width} ${priceHeight}`} className="h-auto w-full">
        {candles.map((c, i) => {
          const bullish = c.close >= c.open;
          const color = bullish ? 'rgb(var(--pnl-positive))' : 'rgb(var(--pnl-negative))';
          return (
            <g key={i}>
              <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
              <rect
                x={x(i) - candleW / 2}
                y={y(Math.max(c.open, c.close))}
                width={candleW}
                height={Math.max(Math.abs(y(c.open) - y(c.close)), 1)}
                fill={color}
              />
            </g>
          );
        })}

        {displayedTrades.map((t, idx) => {
          const entryIdx = t.entryIndex - startIndex;
          const exitIdx = t.exitIndex - startIndex;
          const profitable = t.pnl > 0;
          return (
            <g key={idx}>
              {entryIdx >= 0 && entryIdx < candles.length ? (
                <g transform={`translate(${x(entryIdx)}, ${y(candles[entryIdx].low) + 14})`}>
                  <polygon points="0,0 -5,8 5,8" fill="rgb(var(--accent-trust))" />
                </g>
              ) : null}
              {exitIdx >= 0 && exitIdx < candles.length ? (
                <g transform={`translate(${x(exitIdx)}, ${y(candles[exitIdx].high) - 14})`}>
                  <polygon
                    points="0,0 -5,-8 5,-8"
                    fill={profitable ? 'rgb(var(--pnl-positive))' : 'rgb(var(--pnl-negative))'}
                  />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>

      {result.equityCurve.length > 1 ? (
        <svg viewBox={`0 0 ${width} ${equityHeight}`} className="h-12 w-full">
          <polyline
            points={result.equityCurve
              .slice(startIndex)
              .map((e, i) => `${padding.left + i * ((width - padding.left - padding.right) / (result.equityCurve.length - startIndex - 1 || 1))},${eqY(e.equity)}`)
              .join(' ')}
            fill="none"
            stroke="rgb(var(--accent-trust))"
            strokeWidth={1.5}
          />
        </svg>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="5,0 0,10 10,10" fill="rgb(var(--accent-trust))" />
          </svg>
          Entry
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="5,10 0,0 10,0" fill="rgb(var(--pnl-positive))" />
          </svg>
          Profitable exit
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <polygon points="5,10 0,0 10,0" fill="rgb(var(--pnl-negative))" />
          </svg>
          Losing exit
        </span>
        <span>Equity curve below</span>
      </div>

      {trimmed ? (
        <p className="text-xs text-text-tertiary">
          Showing the most recent {candles.length} of {result.candles.length} candles.
        </p>
      ) : null}
    </div>
  );
}