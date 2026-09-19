'use client';

import { ReactNode } from 'react';
import { LegalHeader } from '@/components/legal/legal-header';
import { TopNav } from '@/components/layout/top-nav';
import { Footer } from '@/components/layout/footer';
import { useOptionalCurrentUser } from '@/lib/queries/useAuth';

/**
 * Chrome for every public static page (legal/*, trust-and-safety,
 * security/bug-bounty). These pages are readable whether or not you're
 * logged in, so the header adapts instead of forcing a login redirect:
 *  - logged in  → the same `TopNav` (with dashboard/brokers/orders/etc. nav)
 *    used everywhere else in the app, so the chrome doesn't change when you
 *    click through to a legal page from inside the product.
 *  - logged out → the plain marketing header with Log in / Sign up.
 * `useOptionalCurrentUser` is the non-redirecting sibling of the hook
 * `DashboardShell` uses — a 401 here just means "logged out", not "go to
 * /login".
 */
export function StaticPageShell({ children }: { children: ReactNode }) {
  const { user, loading } = useOptionalCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {user ? <TopNav user={user} /> : <LegalHeader loading={loading} />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}