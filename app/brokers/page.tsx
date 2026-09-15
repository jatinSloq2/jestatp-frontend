'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banner } from '@/components/ui/banner';
import { StatusBadge } from '@/components/ui/status-badge';
import { useUser } from '@/lib/useUser';
import { api, ApiError, BrokerConnection, BrokerName, SupportedBroker } from '@/lib/api';

const connectHrefByBroker: Record<BrokerName, string> = {
    dhan: '/brokers/connect/dhan',
    zerodha: '/brokers/connect/zerodha',
    groww: '/brokers/connect/groww',
};

export default function BrokersPage() {
    const { user, loading: userLoading } = useUser();
    const [supported, setSupported] = useState<SupportedBroker[] | null>(null);
    const [connections, setConnections] = useState<BrokerConnection[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyBroker, setBusyBroker] = useState<BrokerName | null>(null);

    async function loadAll() {
        setError(null);
        try {
            const [brokers, conns] = await Promise.all([api.listSupportedBrokers(), api.listBrokerConnections()]);
            setSupported(brokers);
            setConnections(conns);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not load broker connections.');
        }
    }

    useEffect(() => {
        loadAll();

        // If we just landed here from a successful connect flow.
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('connected')) {
                setNotice(`${params.get('connected')} connected successfully.`);
                window.history.replaceState({}, '', '/brokers');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function connectionFor(broker: BrokerName) {
        return connections?.find((c) => c.broker === broker) ?? null;
    }

    async function handleSync(broker: BrokerName) {
        setBusyBroker(broker);
        setError(null);
        try {
            await api.syncBroker(broker);
            setNotice('Sync queued — refresh in a few seconds to see updated data.');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not queue sync.');
        } finally {
            setBusyBroker(null);
        }
    }

    async function handleDisconnect(broker: BrokerName) {
        if (!confirm(`Disconnect ${broker}? You'll need to reconnect to sync data again.`)) return;
        setBusyBroker(broker);
        setError(null);
        try {
            await api.disconnectBroker(broker);
            await loadAll();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Could not disconnect.');
        } finally {
            setBusyBroker(null);
        }
    }

    const loading = userLoading || !supported || !connections;

    return (
        <DashboardShell user={user}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Brokers</h1>
                    <p className="mt-1 text-base text-text-secondary">
                        Connect a broker account to sync live orders, positions, and funds.
                    </p>
                </div>

                {notice ? <Banner tone="positive">{notice}</Banner> : null}
                {error ? <Banner tone="negative">{error}</Banner> : null}

                {loading ? (
                    <p className="text-text-secondary">Loading…</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {supported!.map((broker) => {
                            const connection = connectionFor(broker.broker);
                            const isConnected = connection?.status === 'connected';
                            const busy = busyBroker === broker.broker;

                            return (
                                <Card key={broker.broker} className="flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold tracking-tight text-text-primary">{broker.name}</h2>
                                            {connection ? <StatusBadge status={connection.status} /> : null}
                                        </div>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            {broker.authType === 'oauth' ? 'Connect via secure login redirect' : 'Connect using an API token'}
                                        </p>

                                        {connection ? (
                                            <dl className="mt-4 flex flex-col gap-1.5 text-sm">
                                                {connection.clientId ? (
                                                    <div className="flex items-center justify-between">
                                                        <dt className="text-text-tertiary">Client ID</dt>
                                                        <dd className="font-mono text-text-secondary">{connection.clientId}</dd>
                                                    </div>
                                                ) : null}
                                                <div className="flex items-center justify-between">
                                                    <dt className="text-text-tertiary">Last synced</dt>
                                                    <dd className="text-text-secondary">
                                                        {connection.lastSyncedAt ? new Date(connection.lastSyncedAt).toLocaleString() : 'Never'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        ) : null}
                                    </div>

                                    <div className="mt-5 flex gap-2">
                                        {isConnected ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="md"
                                                    className="flex-1"
                                                    loading={busy}
                                                    onClick={() => handleSync(broker.broker)}
                                                >
                                                    Sync now
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="md"
                                                    loading={busy}
                                                    onClick={() => handleDisconnect(broker.broker)}
                                                >
                                                    Disconnect
                                                </Button>
                                            </>
                                        ) : (
                                            <Link href={connectHrefByBroker[broker.broker]} className="flex-1">
                                                <Button type="button" size="md" className="w-full">
                                                    Connect
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}