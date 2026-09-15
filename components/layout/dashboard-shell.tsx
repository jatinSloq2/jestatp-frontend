'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { api, User } from '@/lib/api';

const Logo = () => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent-trust text-text-on-accent">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L6 6L9 9L14 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

interface NavItem {
  label: string;
  href?: string;
  soon?: boolean;
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Brokers', href: '/brokers' },
  { label: 'Orders', href: '/orders' },
  { label: 'Positions', href: '/positions' },
  { label: 'Funds', href: '/funds' },
  { label: 'Strategies', href: '/strategies' },
];

const settingsNav: NavItem[] = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Security', href: '/settings/security' },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = item.href && (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)));

  if (item.soon || !item.href) {
    return (
      <div className="flex items-center justify-between rounded px-3 py-2 text-sm text-text-tertiary">
        <span>{item.label}</span>
        <span className="rounded-full border border-border-strong px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        'block rounded px-3 py-2 text-sm font-medium transition-colors duration-150 ease-confident',
        active
          ? 'bg-accent-trust-soft text-accent-trust-strong'
          : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
      )}
    >
      {item.label}
    </Link>
  );
}

export function DashboardShell({ user, children }: { user: User | null; children: ReactNode }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Cookies may already be gone server-side; proceed to login regardless.
    } finally {
      router.push('/login');
    }
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—';

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight text-text-primary">JestATP</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Trading</p>
            {primaryNav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Account</p>
            {settingsNav.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </div>
        </nav>

        <div className="flex items-center gap-3 border-t border-border px-2 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-sm font-medium text-text-secondary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user?.fullName ?? 'Loading…'}</p>
            <p className="truncate text-xs text-text-tertiary">{user?.email ?? ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-3 rounded px-3 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-pnl-negative disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-semibold tracking-tight text-text-primary">JestATP</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm font-medium text-text-secondary hover:text-pnl-negative"
          >
            Sign out
          </button>
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}