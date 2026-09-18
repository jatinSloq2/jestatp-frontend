const indices = [
  { label: 'NIFTY 50', value: '24,812.35' },
  { label: 'SENSEX', value: '81,244.10' },
  { label: 'USD/INR', value: '83.42' },
  { label: 'BANK NIFTY', value: '52,006.80' },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="relative hidden w-[42%] shrink-0 flex-col justify-between overflow-hidden border-r border-border bg-gradient-to-br from-accent-trust-soft via-surface to-surface px-12 py-12 lg:flex">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent-trust text-text-on-accent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12L6 6L9 9L14 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight text-text-primary">JestATP</span>
          </div>

          <p className="mt-10 max-w-sm text-2xl font-medium leading-snug text-text-primary">
            Automate your strategy. Keep every rail on execution in view.
          </p>
          <p className="mt-4 max-w-sm text-base text-text-secondary">
            Backtest, paper trade, and go live against your own broker
            account — with the same controls a risk desk would insist on.
          </p>
        </div>

        <div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-6">
            {indices.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-text-tertiary">{row.label}</dt>
                <dd className="font-mono text-sm tabular text-text-secondary">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-text-tertiary">
            Reference levels, for orientation only.
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent-trust text-text-on-accent">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12L6 6L9 9L14 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
          <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}