'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { OtpInput } from '@/components/ui/otp-input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { ApiError } from '@/lib/api';
import { useVerifyEmail, useResendVerification } from '@/lib/queries/useAuth';

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  async function handleSubmit() {
    setError(null);
    try {
      await verifyMutation.mutateAsync({ email, code });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'That code didn’t work.');
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendMutation.mutateAsync({ email });
      setResent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t resend the code.');
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
          loading={verifyMutation.isPending}
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
            disabled={resendMutation.isPending}
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