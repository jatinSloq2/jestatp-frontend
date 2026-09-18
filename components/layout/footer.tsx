import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Trading',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Orders', href: '/orders' },
      { label: 'Positions', href: '/positions' },
      { label: 'Holdings', href: '/holdings' },
      { label: 'Funds', href: '/funds' },
    ],
  },
  {
    heading: 'Automation',
    links: [
      { label: 'Strategies', href: '/strategies' },
      { label: 'New strategy', href: '/strategies/new' },
      { label: 'Brokers', href: '/brokers' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Profile', href: '/settings/profile' },
      { label: 'Security & 2FA', href: '/settings/security' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-10">
        <div>
          <span className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="text-base font-semibold tracking-tight text-text-primary">JestATP</span>
          </span>
          <p className="mt-4 max-w-xs text-sm text-text-secondary">
            Algorithmic trading, built on control — backtest, paper trade, and
            execute live against your own connected broker account.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{col.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-accent-trust"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-text-tertiary lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>© {new Date().getFullYear()} JestATP. All rights reserved.</p>
          <p className="max-w-2xl leading-relaxed">
            Trading and investing in the securities market involve risk, and
            automated strategies can amplify losses as readily as gains.
            Broker connections execute orders directly on your own account —
            review every strategy's risk configuration before going live.
          </p>
        </div>
      </div>
    </footer>
  );
}
