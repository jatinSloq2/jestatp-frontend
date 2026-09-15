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
import { api, ApiError } from '@/lib/api';

export default function ConnectGrowwPage() {
    const router = useRouter();
    const { user } = useUser();
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.connectGroww({ apiKey, apiSecret });
            router.push('/brokers?connected=Groww');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not connect Groww. Check your details and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <DashboardShell user={user}>
            <div className="mx-auto flex max-w-lg flex-col gap-6">
                <div>
                    <Link href="/brokers" className="text-sm font-medium text-accent-trust hover:text-accent-trust-strong">
                        ← Back to brokers
                    </Link>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">Connect Groww</h1>
                    <p className="mt-1 text-base text-text-secondary">
                        Generate an API key and secret from Groww's trading-API console and enter them here.
                    </p>
                </div>

                <Card>
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
                        />

                        <Button type="submit" size="lg" loading={loading} className="w-full">
                            Connect Groww
                        </Button>
                    </form>
                </Card>
            </div>
        </DashboardShell>
    );
}