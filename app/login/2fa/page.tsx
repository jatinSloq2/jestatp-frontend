'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { OtpInput } from '@/components/ui/otp-input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { api, ApiError } from '@/lib/api';

function TwoFaChallengeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const method = params.get('method') === 'totp' ? 'totp' : 'email';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.verifyLogin2fa({ code });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That code didn’t work.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await api.resendLogin2fa();
      setResent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t resend the code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      title="Two-step verification"
      subtitle={
        method === 'totp'
          ? 'Enter the 6-digit code from your authenticator app.'
          : 'Enter the 6-digit code we emailed you.'
      }
    >
      <div className="flex flex-col gap-5">
        {error ? <Banner tone="negative">{error}</Banner> : null}
        {resent ? <Banner tone="positive">A new code is on its way.</Banner> : null}

        <OtpInput value={code} onChange={setCode} />

        <Button
          type="button"
          size="lg"
          loading={loading}
          disabled={code.length !== 6}
          className="w-full"
          onClick={handleSubmit}
        >
          Verify
        </Button>

        {method === 'email' ? (
          <p className="text-center text-sm text-text-secondary">
            Didn’t get it?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-accent-trust hover:text-accent-trust-strong disabled:opacity-50"
            >
              Resend code
            </button>
          </p>
        ) : (
          <p className="text-center text-sm text-text-tertiary">
            Codes refresh every 30 seconds in your authenticator app.
          </p>
        )}
      </div>
    </AuthShell>
  );
}

export default function TwoFaChallengePage() {
  return (
    <Suspense>
      <TwoFaChallengeForm />
    </Suspense>
  );
}
