'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Banner } from '@/components/ui/banner';
import { RefreshButton } from '@/components/ui/refresh-button';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/useUser';

const modules = [
  {
    title: 'Brokers',
    description: 'Connect and manage broker accounts.',
    href: '/brokers',
    icon: (
      <path d="M4 10L12 4L20 10V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V10Z" strokeWidth="1.6" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Orders',
    description: 'Your order book, synced live.',
    href: '/orders',
    icon: <path d="M6 4H18V20L15 18L12 20L9 18L6 20V4Z" strokeWidth="1.6" strokeLinejoin="round" />,
  },
  {
    title: 'Positions',
    description: 'Open positions with real-time P&L.',
    href: '/positions',
    icon: <path d="M4 18L9 11L13 14L20 6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: 'Funds',
    description: 'Available balance and margin.',
    href: '/funds',
    icon: (
      <>
        <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
        <path d="M12 8V16M9.5 10.2C9.5 9 10.6 8.3 12 8.3C13.4 8.3 14.5 9 14.5 10.1C14.5 12.3 9.5 11.7 9.5 13.9C9.5 15 10.6 15.7 12 15.7C13.4 15.7 14.5 15 14.5 13.8" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
  },
];

export default function DashboardPage() {
  const { user, loading, error, refresh } = useUser();

  if (loading) {
    return (
      <DashboardShell user={null}>
        <p className="text-text-secondary">Loading your account…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-gradient-to-br from-accent-trust-soft via-surface to-surface p-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
            </h1>
            <p className="mt-1 text-base text-text-secondary">Here&rsquo;s where things stand on your account.</p>
          </div>
          <RefreshButton onClick={refresh} loading={loading} />
        </div>

        {error ? <Banner tone="negative">{error}</Banner> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Account status">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Email</dt>
                <dd className="font-medium text-text-primary">{user?.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Email verified</dt>
                <dd className={user?.isEmailVerified ? 'text-pnl-positive' : 'text-risk-warning'}>
                  {user?.isEmailVerified ? 'Yes' : 'No'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Two-factor auth</dt>
                <dd className={user?.twoFactorEnabled ? 'text-pnl-positive' : 'text-text-tertiary'}>
                  {user?.twoFactorEnabled ? `Enabled (${user.twoFactorMethod})` : 'Disabled'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">Sign-in method</dt>
                <dd className="font-medium capitalize text-text-primary">{user?.authProvider}</dd>
              </div>
            </dl>
            <Link
              href="/settings/security"
              className="mt-5 inline-block text-sm font-medium text-accent-trust hover:text-accent-trust-strong"
            >
              Manage security settings →
            </Link>
          </Card>

          <Card title="Get started">
            <p className="text-sm text-text-secondary">
              Connect a broker to start syncing live orders, positions, and funds — then build your first strategy.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/brokers" className="flex-1">
                <Button type="button" className="w-full">
                  Connect a broker
                </Button>
              </Link>
              <Link href="/strategies/new" className="flex-1">
                <Button type="button" variant="secondary" className="w-full">
                  New strategy
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Trading</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod) => (
              <Link
                key={mod.title}
                href={mod.href}
                className="group rounded-lg border border-border bg-surface p-4 shadow-panel transition-colors hover:border-accent-trust"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-trust-soft text-accent-trust-strong">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {mod.icon}
                  </svg>
                </span>
                <p className="mt-3 font-medium text-text-primary group-hover:text-accent-trust-strong">{mod.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{mod.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
