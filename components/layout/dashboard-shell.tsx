'use client';

import { ReactNode } from 'react';
import { User } from '@/lib/api';
import { TopNav } from '@/components/layout/top-nav';
import { Footer } from '@/components/layout/footer';

/**
 * App chrome for every authenticated page. Previously a fixed left sidebar;
 * now a Groww-style top navbar (see `TopNav`) plus a full-width footer, so
 * pages get their full width back and navigation reads the same way it
 * does on a real broker/trading product.
 */
export function DashboardShell({ user, children }: { user: User | null; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopNav user={user} />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl animate-fade-up min-h-screen">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
