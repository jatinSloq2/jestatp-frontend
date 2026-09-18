'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { useUser } from '@/lib/useUser';
import { ApiError } from '@/lib/api';
import { useConnectDhan } from '@/lib/queries/useBrokers';

export default function ConnectDhanPage() {
    const router = useRouter();
    const { user } = useUser();
    const [clientId, setClientId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const connectMutation = useConnectDhan();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await connectMutation.mutateAsync({ clientId, accessToken });
            router.push('/brokers?connected=Dhan');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not connect Dhan. Check your details and try again.');
        }
    }

    return (
        <DashboardShell user={user}>
            <div className="mx-auto flex max-w-lg flex-col gap-6">
                <div>
                    <Link href="/brokers" className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
                        ← Back to brokers
                    </Link>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">Connect Dhan</h1>
                    <p className="mt-1 text-base text-text-secondary">
                        We never see your Dhan login, PIN, or OTP — you generate a personal access token from Dhan's own
                        dashboard and paste it here.
                    </p>
                </div>

                <Card>
                    <ol className="mb-5 flex flex-col gap-1.5 text-sm text-text-secondary">
                        <li>1. Log in to web.dhan.co</li>
                        <li>2. Go to Profile → Trading APIs → Access Token</li>
                        <li>3. Generate a token and copy your Client ID and the token</li>
                    </ol>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error ? <Banner tone="negative">{error}</Banner> : null}

                        <Input
                            label="Client ID"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                            autoComplete="off"
                        />

                        <Input
                            label="Access token"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            required
                            autoComplete="off"
                            type="password"
                        />

                        <Button type="submit" size="lg" loading={connectMutation.isPending} className="w-full">
                            Connect Dhan
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardShell>
    );
}