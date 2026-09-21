'use client';

import { CustomIndicatorTestResult } from '@/lib/api';

export function IndicatorPreviewChart({ result }: { result: CustomIndicatorTestResult }) {
  const width = 640;
  const height = 140;
  const padding = { top: 10, bottom: 10, left: 8, right: 8 };

  const points = result.series
    .map((v, i) => (v === null ? null : { i, v }))
    .filter((p): p is { i: number; v: number } => p !== null);

  if (points.length < 2) {
    return <p className="text-sm text-text-secondary">Not enough defined values to chart yet — try a longer date range or a shorter warm-up period.</p>;
  }

  const values = points.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1e-9);
  const chartH = height - padding.top - padding.bottom;
  const slotW = (width - padding.left - padding.right) / (result.series.length - 1 || 1);

  function y(v: number) {
    return padding.top + chartH - ((v - min) / range) * chartH;
  }

  const path = points.map((p) => `${p.i === points[0].i ? 'M' : 'L'} ${padding.left + p.i * slotW} ${y(p.v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <path d={path} fill="none" stroke="rgb(var(--accent-trust))" strokeWidth={1.75} />
      {points.length > 0 ? (
        <circle cx={padding.left + points[points.length - 1].i * slotW} cy={y(points[points.length - 1].v)} r={3} fill="rgb(var(--accent-trust))" />
      ) : null}
    </svg>
  );
}
