'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { OtpInput } from '@/components/ui/otp-input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { api, ApiError } from '@/lib/api';

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.verifyEmail({ email, code });
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
      await api.resendVerification({ email });
      setResent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t resend the code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell title="Verify your email" subtitle={email ? `Enter the 6-digit code sent to ${email}.` : 'Enter the 6-digit code we emailed you.'}>
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
          Verify email
        </Button>

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
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
