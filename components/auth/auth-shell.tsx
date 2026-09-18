import Link from 'next/link';
import { Logo, LogoMark } from '@/components/brand/logo';
import { IndexTicker } from '@/components/layout/index-ticker';

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
