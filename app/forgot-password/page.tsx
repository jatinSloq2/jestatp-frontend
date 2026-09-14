'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { api, ApiError } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t send a reset link. Try again.');
    } finally {
      setLoading(false);
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

        <Button type="submit" size="lg" loading={loading} className="w-full">
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
