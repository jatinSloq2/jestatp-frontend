'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { ApiError } from '@/lib/api';
import { useResetPassword } from '@/lib/queries/useAuth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const resetPasswordMutation = useResetPassword();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password needs to be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, password });
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t reset your password. Try again.');
    }
  }

  if (!token) {
    return (
      <AuthShell title="Invalid reset link" subtitle="This link is missing its token.">
        <div className="flex flex-col gap-5">
          <Banner tone="negative">
            This reset link looks broken or incomplete. Request a new one from the forgot-password page.
          </Banner>
          <Link href="/forgot-password">
            <Button type="button" size="lg" className="w-full">
              Request a new link
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password reset" subtitle="Redirecting you to sign in…">
        <Banner tone="positive">
          Your password has been changed. Every other session has been signed out for safety.
        </Banner>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it something you haven’t used before.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error ? <Banner tone="negative">{error}</Banner> : null}

        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" size="lg" loading={resetPasswordMutation.isPending} className="mt-1 w-full">
          Reset password
        </Button>

        <p className="text-center text-sm text-text-secondary">
          <Link href="/login" className="font-medium text-accent-trust hover:text-accent-trust-strong">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}