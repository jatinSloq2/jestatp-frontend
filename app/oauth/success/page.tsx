'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogoMark } from '@/components/brand/logo';

/**
 * Google OAuth redirects here after the backend's /auth/google/callback.
 * - If 2FA is required, the backend appends ?requires2fa=true&method=...
 *   and has already set the short-lived twofaToken cookie — send the user
 *   to finish that flow.
 * - Otherwise, session cookies are already set — just go to the dashboard.
 */
function OAuthSuccessContent() {
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

  return <SuccessLoader />;
}

function SuccessLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <LogoMark size={40} />
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
        <p className="text-base text-text-secondary">Finishing sign in…</p>
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoader />}>
      <OAuthSuccessContent />
    </Suspense>
  );
}
