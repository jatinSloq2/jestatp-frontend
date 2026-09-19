import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';

export function LegalHeader({ loading = false }: { loading?: boolean }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="text-base font-semibold tracking-tight text-text-primary">JestATP</span>
        </Link>

        {/* While we're still checking whether the visitor is logged in, skip
            straight to a blank right side rather than flashing Log in/Sign up
            for a logged-in user who's about to see TopNav instead. */}
        {loading ? (
          <div className="h-9 w-[140px]" aria-hidden />
        ) : (
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-text-secondary hover:text-text-primary">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-accent-trust px-3.5 py-2 font-medium text-text-on-accent hover:bg-accent-trust-strong"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}