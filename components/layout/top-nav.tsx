'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Logo } from '@/components/brand/logo';
import { IndexTicker } from '@/components/layout/index-ticker';
import { User } from '@/lib/api';
import { useLogout } from '@/lib/queries/useAuth';

interface NavItem {
  label: string;
  href: string;
}

const primaryNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Brokers', href: '/brokers' },
  { label: 'Orders', href: '/orders' },
  { label: 'Positions', href: '/positions' },
  { label: 'Holdings', href: '/holdings' },
  { label: 'Funds', href: '/funds' },
  { label: 'Strategies', href: '/strategies' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`));
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {open ? (
        <path d="M5.5 5.5L16.5 16.5M16.5 5.5L5.5 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <>
          <path d="M3.5 6.5H18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.5 11H18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.5 15.5H18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const loggingOut = logoutMutation.isPending;

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logoutMutation.mutate();
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
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="shrink-0">
            <Logo markSize={30} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    'rounded px-3 py-2 text-sm font-medium transition-colors duration-150 ease-confident',
                    active
                      ? 'bg-accent-trust-soft text-accent-trust-strong'
                      : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-surface-raised"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-trust-soft text-sm font-medium text-accent-trust-strong">
                {initials}
              </span>
              <ChevronDown className="text-text-tertiary" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-40 mt-2 w-56 rounded-md border border-border bg-surface py-2 shadow-panel animate-fade-up">
                <div className="border-b border-border px-3.5 pb-2.5">
                  <p className="truncate text-sm font-medium text-text-primary">{user?.fullName ?? 'Loading…'}</p>
                  <p className="truncate text-xs text-text-tertiary">{user?.email ?? ''}</p>
                </div>
                <Link
                  href="/settings/profile"
                  className="block px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                >
                  Profile
                </Link>
                <Link
                  href="/settings/security"
                  className="block px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                >
                  Security
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="block w-full px-3.5 py-2 text-left text-sm font-medium text-text-secondary hover:bg-surface-raised hover:text-pnl-negative disabled:opacity-50"
                >
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded text-text-secondary hover:bg-surface-raised lg:hidden"
            aria-label="Toggle menu"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      <div className="hidden border-t border-border px-6 py-2 lg:block lg:px-10">
        <IndexTicker compact className="mx-auto max-w-7xl" />
      </div>

      {mobileOpen ? (
        <nav className="flex flex-col gap-1 border-t border-border bg-surface px-4 py-3 lg:hidden">
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  'rounded px-3 py-2.5 text-sm font-medium',
                  active
                    ? 'bg-accent-trust-soft text-accent-trust-strong'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center gap-3 border-t border-border px-3 pt-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-trust-soft text-sm font-medium text-accent-trust-strong">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{user?.fullName ?? 'Loading…'}</p>
              <p className="truncate text-xs text-text-tertiary">{user?.email ?? ''}</p>
            </div>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            <Link href="/settings/profile" className="rounded px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised">
              Profile
            </Link>
            <Link href="/settings/security" className="rounded px-3 py-2 text-sm text-text-secondary hover:bg-surface-raised">
              Security
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded px-3 py-2 text-left text-sm font-medium text-text-secondary hover:bg-surface-raised hover:text-pnl-negative disabled:opacity-50"
            >
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
