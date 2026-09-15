'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Google OAuth redirects here after the backend's /auth/google/callback.
 * - If 2FA is required, the backend appends ?requires2fa=true&method=...
 *   and has already set the short-lived twofaToken cookie — send the user
 *   to finish that flow.
 * - Otherwise, session cookies are already set — just go to the dashboard.
 */
export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const requires2fa = searchParams.get('requires2fa');
    const method = searchParams.get('method');

    if (requires2fa === 'true') {
      router.replace(`/login/2fa?method=${method ?? 'email'}`);
    } else {
      router.replace('/dashboard');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
        <p className="text-base text-text-secondary">Finishing sign in…</p>
      </div>
    </div>
  );
}