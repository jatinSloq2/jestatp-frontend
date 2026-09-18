'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { OtpInput } from '@/components/ui/otp-input';
import { useUser } from '@/lib/useUser';
import { ApiError } from '@/lib/api';
import {
  useSessions,
  useTotpSetup,
  useEmailTwoFaSetup,
  useTotpEnable,
  useEmailTwoFaEnable,
  useDisable2fa,
  useLogoutAll,
} from '@/lib/queries/useSettings';

type SetupFlow = 'none' | 'totp' | 'email';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  const [flow, setFlow] = useState<SetupFlow>('none');
  const [totpData, setTotpData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [disablePassword, setDisablePassword] = useState('');

  const sessionsQuery = useSessions();
  const [sessionsActionError, setSessionsActionError] = useState<string | null>(null);

  const totpSetupMutation = useTotpSetup();
  const emailTwoFaSetupMutation = useEmailTwoFaSetup();
  const totpEnableMutation = useTotpEnable();
  const emailTwoFaEnableMutation = useEmailTwoFaEnable();
  const disable2faMutation = useDisable2fa();
  const logoutAllMutation = useLogoutAll();

  const busy =
    totpSetupMutation.isPending ||
    emailTwoFaSetupMutation.isPending ||
    totpEnableMutation.isPending ||
    emailTwoFaEnableMutation.isPending;

  function resetFlow() {
    setFlow('none');
    setTotpData(null);
    setCode('');
    setError(null);
    setInfo(null);
  }

  async function startTotpSetup() {
    setError(null);
    try {
      const data = await totpSetupMutation.mutateAsync();
      setTotpData(data);
      setFlow('totp');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start 2FA setup.');
    }
  }

  async function startEmailSetup() {
    setError(null);
    try {
      const result = await emailTwoFaSetupMutation.mutateAsync();
      setInfo(result.message);
      setFlow('email');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a confirmation code.');
    }
  }

  async function confirmTotp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await totpEnableMutation.mutateAsync({ code });
      resetFlow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code. Try again.');
    }
  }

  async function confirmEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await emailTwoFaEnableMutation.mutateAsync({ code });
      resetFlow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code. Try again.');
    }
  }

  async function handleDisable(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await disable2faMutation.mutateAsync({ password: disablePassword || undefined });
      setDisablePassword('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not disable 2FA.');
    }
  }

  async function handleLogoutAll() {
    setSessionsActionError(null);
    try {
      await logoutAllMutation.mutateAsync();
      router.push('/login');
    } catch (err) {
      setSessionsActionError(err instanceof ApiError ? err.message : 'Could not log out other sessions.');
    }
  }

  const sessions = sessionsQuery.data ?? null;
  const sessionsError =
    sessionsActionError ?? (sessionsQuery.error instanceof ApiError ? sessionsQuery.error.message : null);

  if (loading) {
    return (
      <DashboardShell user={null}>
        <p className="text-text-secondary">Loading…</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Security</h1>
          <p className="mt-1 text-base text-text-secondary">Two-factor authentication and active sessions.</p>
        </div>

        <Card title="Two-factor authentication">
          {user?.twoFactorEnabled ? (
            <div className="flex flex-col gap-4">
              <Banner tone="positive">
                2FA is enabled using {user.twoFactorMethod === 'totp' ? 'an authenticator app' : 'email codes'}.
              </Banner>

              <form onSubmit={handleDisable} className="flex flex-col gap-4">
                {error ? <Banner tone="negative">{error}</Banner> : null}
                {user.authProvider === 'local' ? (
                  <Input
                    label="Confirm your password to disable 2FA"
                    type="password"
                    autoComplete="current-password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                  />
                ) : null}
                <div>
                  <Button type="submit" variant="destructive" loading={disable2faMutation.isPending}>
                    Disable 2FA
                  </Button>
                </div>
              </form>
            </div>
          ) : flow === 'none' ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Add a second step at login using an authenticator app or a code emailed to you.
              </p>
              {error ? <Banner tone="negative">{error}</Banner> : null}
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={startTotpSetup} loading={busy}>
                  Use authenticator app
                </Button>
                <Button type="button" variant="secondary" onClick={startEmailSetup} loading={busy}>
                  Use email codes
                </Button>
              </div>
            </div>
          ) : flow === 'totp' && totpData ? (
            <form onSubmit={confirmTotp} className="flex flex-col gap-5">
              {error ? <Banner tone="negative">{error}</Banner> : null}
              <p className="text-sm text-text-secondary">
                Scan this QR code with Google Authenticator, Authy, or any TOTP app, then enter the 6-digit code it
                shows.
              </p>
              <img
                src={totpData.qrCodeDataUrl}
                alt="Scan with your authenticator app"
                className="h-44 w-44 self-start rounded border border-border bg-white p-2"
              />
              <p className="text-xs text-text-tertiary">
                Can't scan? Enter this code manually:{' '}
                <span className="font-mono text-text-secondary">{totpData.secret}</span>
              </p>
              <OtpInput value={code} onChange={setCode} />
              <div className="flex gap-3">
                <Button type="submit" loading={busy} disabled={code.length !== 6}>
                  Confirm and enable
                </Button>
                <Button type="button" variant="ghost" onClick={resetFlow}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : flow === 'email' ? (
            <form onSubmit={confirmEmail} className="flex flex-col gap-5">
              {error ? <Banner tone="negative">{error}</Banner> : null}
              {info ? <Banner tone="neutral">{info}</Banner> : null}
              <p className="text-sm text-text-secondary">Enter the 6-digit code we just emailed you.</p>
              <OtpInput value={code} onChange={setCode} />
              <div className="flex gap-3">
                <Button type="submit" loading={busy} disabled={code.length !== 6}>
                  Confirm and enable
                </Button>
                <Button type="button" variant="ghost" onClick={resetFlow}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </Card>

        <Card title="Active sessions" description="Devices currently signed in to your account.">
          {sessionsError ? <Banner tone="negative">{sessionsError}</Banner> : null}
          {!sessions ? (
            <p className="text-sm text-text-secondary">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-text-secondary">No active sessions found.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {session.userAgent ?? 'Unknown device'}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {session.ipAddress ?? 'Unknown IP'} · signed in {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-border pt-5">
            <p className="text-sm text-text-secondary">
              Sessions are revoked individually only by expiry. To sign out of every device immediately, use the
              option below.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="mt-3"
              onClick={handleLogoutAll}
              loading={logoutAllMutation.isPending}
            >
              Log out of all devices
            </Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}