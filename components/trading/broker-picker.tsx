'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, BrokerConnection, BrokerName } from '@/lib/api';

export function useConnectedBrokers() {
  const [connections, setConnections] = useState<BrokerConnection[] | null>(null);
  const [broker, setBroker] = useState<BrokerName | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listBrokerConnections()
      .then((conns) => {
        setConnections(conns);
        const connected = conns.find((c) => c.status === 'connected');
        if (connected) setBroker(connected.broker);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load your broker connections.'));
  }, []);

  const connectedBrokers = connections?.filter((c) => c.status === 'connected') ?? [];

  return { connections, connectedBrokers, broker, setBroker, error, loading: connections === null && !error };
}

const selectClass =
  'h-10 rounded border border-border-strong bg-surface-sunken px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';

export function BrokerSelect({
  connections,
  value,
  onChange,
}: {
  connections: BrokerConnection[];
  value: BrokerName | null;
  onChange: (broker: BrokerName) => void;
}) {
  return (
    <select className={selectClass} value={value ?? ''} onChange={(e) => onChange(e.target.value as BrokerName)}>
      {connections.map((c) => (
        <option key={c.broker} value={c.broker}>
          {c.broker.charAt(0).toUpperCase() + c.broker.slice(1)}
          {c.clientId ? ` (${c.clientId})` : ''}
        </option>
      ))}
    </select>
  );
}