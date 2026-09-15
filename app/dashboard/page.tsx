'use client';

import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Banner } from '@/components/ui/banner';
import { useUser } from '@/lib/useUser';

export default function DashboardPage() {
  const { user, loading, error } = useUser();

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
          </h1>
          <p className="mt-1 text-base text-text-secondary">Here's where things stand on your account.</p>
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
                <button
                  type="button"
                  className="w-full rounded bg-accent-trust px-4 py-2.5 text-sm font-medium text-text-on-accent transition-colors duration-150 ease-confident hover:bg-accent-trust-strong"
                >
                  Connect a broker
                </button>
              </Link>
              <Link href="/strategies/new" className="flex-1">
                <button
                  type="button"
                  className="w-full rounded border border-border-strong px-4 py-2.5 text-sm font-medium text-text-primary transition-colors duration-150 ease-confident hover:bg-surface-raised"
                >
                  New strategy
                </button>
              </Link>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Trading</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Brokers', description: 'Connect and manage broker accounts.', href: '/brokers' },
              { title: 'Orders', description: 'Your order book, synced live.', href: '/orders' },
              { title: 'Positions', description: 'Open positions with real-time P&L.', href: '/positions' },
              { title: 'Funds', description: 'Available balance and margin.', href: '/funds' },
            ].map((mod) => (
              <Link key={mod.title} href={mod.href} className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent-trust">
                <p className="font-medium text-text-primary">{mod.title}</p>
                <p className="mt-1.5 text-sm text-text-secondary">{mod.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}