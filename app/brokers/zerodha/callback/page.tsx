'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { ApiError } from '@/lib/api';
import { useConnectZerodha } from '@/lib/queries/useBrokers';

const STASH_KEY = 'zerodha_connect_pending';

type State = 'connecting' | 'error';

function ZerodhaCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, setState] = useState<State>('connecting');
    const [error, setError] = useState<string | null>(null);
    const connectMutation = useConnectZerodha();

    useEffect(() => {
        async function complete() {
            const requestToken = searchParams.get('request_token');
            const status = searchParams.get('status');

            if (status && status !== 'success') {
                setError('Zerodha reported the login did not succeed. Please try connecting again.');
                setState('error');
                return;
            }

            if (!requestToken) {
                setError('Missing request token from Zerodha. Please try connecting again.');
                setState('error');
                return;
            }

            const stashed = sessionStorage.getItem(STASH_KEY);
            if (!stashed) {
                setError(
                    'We lost track of your API key/secret for this connection attempt (this can happen if you refreshed or opened this link in a new tab). Please start over.',
                );
                setState('error');
                return;
            }

            const { apiKey, apiSecret } = JSON.parse(stashed) as { apiKey: string; apiSecret: string };
            sessionStorage.removeItem(STASH_KEY);

            try {
                await connectMutation.mutateAsync({ apiKey, apiSecret, requestToken });
                router.push('/brokers?connected=Zerodha');
            } catch (err) {
                setError(err instanceof ApiError ? err.message : 'Could not complete the Zerodha connection.');
                setState('error');
            }
        }

        complete();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (state === 'connecting') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-canvas">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
                    <p className="text-base text-text-secondary">Completing your Zerodha connection…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Connection failed</h1>
                {error ? (
                    <div className="mt-4">
                        <Banner tone="negative">{error}</Banner>
                    </div>
                ) : null}
                <Link href="/brokers/connect/zerodha">
                    <Button type="button" size="lg" className="mt-6 w-full">
                        Try again
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function ZerodhaCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-canvas">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
                        <p className="text-base text-text-secondary">Completing your Zerodha connection…</p>
                    </div>
                </div>
            }
        >
            <ZerodhaCallbackContent />
        </Suspense>
    );
}