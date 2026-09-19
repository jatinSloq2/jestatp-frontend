'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { ApiError } from '@/lib/api';
import { useRegister } from '@/lib/queries/useAuth';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegister();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password needs to be at least 8 characters.');
      return;
    }

    try {
      await registerMutation.mutateAsync({ fullName, email, password });
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t create your account. Try again.');
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Set up access before connecting a broker.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error ? <Banner tone="negative">{error}</Banner> : null}

        <Input
          label="Full name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" loading={registerMutation.isPending} className="mt-1 w-full">
          Create account
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent-trust hover:text-accent-trust-strong">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}