'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { useUser } from '@/lib/useUser';
import { ApiError } from '@/lib/api';
import { useZerodhaLoginUrl } from '@/lib/queries/useBrokers';

// Key used to stash credentials across the redirect to Zerodha's domain and
// back — sessionStorage survives a full page navigation, unlike React state.
const STASH_KEY = 'zerodha_connect_pending';

export default function ConnectZerodhaPage() {
    const { user } = useUser();
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState('…/brokers/zerodha/callback');
    const loginUrlMutation = useZerodhaLoginUrl();

    useEffect(() => {
        setRedirectUrl(`${window.location.origin}/brokers/zerodha/callback`);
    }, []);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const { loginUrl } = await loginUrlMutation.mutateAsync({ apiKey });
            sessionStorage.setItem(STASH_KEY, JSON.stringify({ apiKey, apiSecret }));
            window.location.href = loginUrl;
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not start Zerodha login. Try again.');
        }
    }

    return (
        <DashboardShell user={user}>
            <div className="mx-auto flex max-w-lg flex-col gap-6">
                <div>
                    <Link href="/brokers" className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
                        ← Back to brokers
                    </Link>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">Connect Zerodha</h1>
                    <p className="mt-1 text-base text-text-secondary">
                        You'll log in on Zerodha's own site — including any 2FA — and come straight back here. We never see your
                        Zerodha password.
                    </p>
                </div>

                <Card>
                    <ol className="mb-5 flex flex-col gap-1.5 text-sm text-text-secondary">
                        <li>1. Create a Kite Connect app at developers.kite.trade</li>
                        <li>
                            2. Set its redirect URL to <span className="font-mono text-text-tertiary">{redirectUrl}</span>
                        </li>
                        <li>3. Copy the app's API key and API secret below</li>
                    </ol>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error ? <Banner tone="negative">{error}</Banner> : null}

                        <Input label="API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required autoComplete="off" />

                        <Input
                            label="API secret"
                            value={apiSecret}
                            onChange={(e) => setApiSecret(e.target.value)}
                            required
                            autoComplete="off"
                            type="password"
                            hint="Needed to complete the connection once you return from Zerodha's login."
                        />

                        <Button type="submit" size="lg" loading={loginUrlMutation.isPending} className="w-full">
                            Continue to Zerodha login
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardShell>
    );
}