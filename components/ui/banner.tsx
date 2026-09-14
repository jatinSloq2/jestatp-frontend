import clsx from 'clsx';

type Tone = 'negative' | 'warning' | 'positive' | 'neutral';

const toneClasses: Record<Tone, string> = {
  negative: 'border-risk-critical/40 bg-risk-critical/10 text-pnl-negative',
  warning: 'border-risk-warning/40 bg-risk-warning/10 text-risk-warning',
  positive: 'border-pnl-positive/40 bg-pnl-positive/10 text-pnl-positive',
  neutral: 'border-border-strong bg-surface-raised text-text-secondary',
};

export function Banner({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div className={clsx('rounded border px-3.5 py-3 text-sm leading-snug', toneClasses[tone])}>
      {children}
    </div>
  );
}
