'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { OtpInput } from '@/components/ui/otp-input';
import { useUser } from '@/lib/useUser';
import { api, ApiError, Session } from '@/lib/api';

type SetupFlow = 'none' | 'totp' | 'email';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { user, loading, refresh } = useUser();

  const [flow, setFlow] = useState<SetupFlow>('none');
  const [totpData, setTotpData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    api
      .sessions()
      .then(setSessions)
      .catch((err) => setSessionsError(err instanceof ApiError ? err.message : 'Could not load sessions.'));
  }, []);

  function resetFlow() {
    setFlow('none');
    setTotpData(null);
    setCode('');
    setError(null);
    setInfo(null);
  }

  async function startTotpSetup() {
    setError(null);
    setBusy(true);
    try {
      const data = await api.totpSetup();
      setTotpData(data);
      setFlow('totp');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start 2FA setup.');
    } finally {
      setBusy(false);
    }
  }

  async function startEmailSetup() {
    setError(null);
    setBusy(true);
    try {
      const result = await api.emailTwoFaSetup();
      setInfo(result.message);
      setFlow('email');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a confirmation code.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmTotp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.totpEnable({ code });
      await refresh();
      resetFlow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.emailTwoFaEnable({ code });
      await refresh();
      resetFlow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDisabling(true);
    try {
      await api.disable2fa({ password: disablePassword || undefined });
      setDisablePassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not disable 2FA.');
    } finally {
      setDisabling(false);
    }
  }

  async function handleLogoutAll() {
    setLoggingOutAll(true);
    try {
      await api.logoutAll();
      router.push('/login');
    } catch (err) {
      setSessionsError(err instanceof ApiError ? err.message : 'Could not log out other sessions.');
      setLoggingOutAll(false);
    }
  }

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
                  <Button type="submit" variant="destructive" loading={disabling}>
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
              loading={loggingOutAll}
            >
              Log out of all devices
            </Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}