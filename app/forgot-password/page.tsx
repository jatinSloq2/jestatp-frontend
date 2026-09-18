'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { ApiError } from '@/lib/api';
import { useForgotPassword } from '@/lib/queries/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await forgotPasswordMutation.mutateAsync({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t send a reset link. Try again.');
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`If an account exists for ${email}, a reset link is on its way.`}>
        <div className="flex flex-col gap-5">
          <Banner tone="neutral">Links expire after a short window. Request a new one if yours doesn’t work.</Banner>
          <Link href="/login">
            <Button type="button" variant="secondary" size="lg" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your account email and we’ll send you a reset link.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error ? <Banner tone="negative">{error}</Banner> : null}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" size="lg" loading={forgotPasswordMutation.isPending} className="w-full">
          Send reset link
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