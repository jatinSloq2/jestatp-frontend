import Link from 'next/link';
import { ShieldCheck, Activity, Lock, LineChart } from 'lucide-react';
import { Logo, LogoMark } from '@/components/brand/logo';
import { IndexTicker } from '@/components/layout/index-ticker';

const FEATURES = [
  {
    icon: LineChart,
    title: 'Backtest on real tick data',
    description: 'Validate a strategy against years of historical fills before it touches live capital.',
  },
  {
    icon: Activity,
    title: 'Paper trade in parallel',
    description: 'Run simulated and live books side by side to confirm behavior before switching over.',
  },
  {
    icon: ShieldCheck,
    title: 'Built-in risk controls',
    description: 'Position limits, drawdown stops, and kill switches enforced at the execution layer.',
  },
  {
    icon: Lock,
    title: 'Broker-grade security',
    description: 'Read-only API keys, encrypted at rest, with full audit logs on every order sent.',
  },
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
          <Link href="/">
            <Logo />
          </Link>

          <p className="mt-10 max-w-sm text-2xl font-medium leading-snug text-text-primary">
            Automate your strategy. Keep every rail on execution in view.
          </p>
          <p className="mt-4 max-w-sm text-base text-text-secondary">
            Backtest, paper trade, and go live against your own broker
            account — with the same controls a risk desk would insist on.
          </p>

          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title: featureTitle, description }) => (
              <li key={featureTitle} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-primary">
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{featureTitle}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="border-t border-border pt-6">
            <IndexTicker className="flex-wrap gap-x-8 gap-y-3" />
          </div>
          <p className="mt-5 text-sm text-text-tertiary">Reference levels, for orientation only.</p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <LogoMark />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
          <p className="mt-2 text-base text-text-secondary">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}