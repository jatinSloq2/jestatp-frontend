'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { api, ApiError } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await api.login({ email, password });
      if (result.status === 'verified') {
        router.push('/dashboard');
      } else if (result.status === 'requires_email_verification') {
        router.push(`/verify-email?email=${encodeURIComponent(result.email ?? email)}`);
      } else if (result.status === 'requires_2fa') {
        router.push(`/login/2fa?method=${result.method ?? 'email'}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t sign you in. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Enter your credentials to access your account.">
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

        <div className="flex flex-col gap-1.5">
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link href="/forgot-password" className="self-end text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          Sign in
        </Button>

        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <div className="h-px flex-1 bg-border" />
          or
          <div className="h-px flex-1 bg-border" />
        </div>

        <a href={`${API_BASE}/auth/google`}>
          <Button type="button" variant="secondary" size="lg" className="w-full">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.95a9 9 0 0 0 0 8.06l3-2.33Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </a>

        <p className="text-center text-sm text-text-secondary">
          Don’t have an account?{' '}
          <Link href="/signup" className="font-medium text-accent-trust hover:text-accent-trust-strong">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
