export function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatCurrency(value: number): string {
  return `₹${formatMoney(value)}`;
}

export function formatPnl(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatMoney(value)}`;
}

export function formatPnlPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function pnlClass(value: number): string {
  if (value > 0) return 'text-pnl-positive';
  if (value < 0) return 'text-pnl-negative';
  return 'text-text-secondary';
}

export function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
