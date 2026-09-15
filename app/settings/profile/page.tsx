'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { useUser } from '@/lib/useUser';
import { api, ApiError } from '@/lib/api';

export default function ProfileSettingsPage() {
  const { user, loading, refresh } = useUser();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await api.updateProfile({ fullName });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update your profile. Try again.');
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Profile</h1>
          <p className="mt-1 text-base text-text-secondary">Update your account details.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error ? <Banner tone="negative">{error}</Banner> : null}
            {saved ? <Banner tone="positive">Profile updated.</Banner> : null}

            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              minLength={2}
              maxLength={120}
              required
            />

            <Input label="Email" value={user?.email ?? ''} disabled hint="Your email can't be changed here." />

            <div>
              <Button type="submit" loading={saving} disabled={fullName === user?.fullName}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Account details">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Sign-in method</dt>
              <dd className="font-medium capitalize text-text-primary">{user?.authProvider}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Role</dt>
              <dd className="font-medium capitalize text-text-primary">{user?.role}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Member since</dt>
              <dd className="font-medium text-text-primary">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </DashboardShell>
  );
}