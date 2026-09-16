'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, BrokerConnection, BrokerName } from '@/lib/api';
import { Select } from '@/components/ui/select';

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
    <Select
      label="Broker"
      hideLabel
      size="sm"
      triggerClassName="w-auto min-w-[10rem]"
      searchable={false}
      allowCustomValue={false}
      value={value ?? ''}
      onChange={(v) => onChange(v as BrokerName)}
      options={connections.map((c) => ({
        value: c.broker,
        label: c.broker.charAt(0).toUpperCase() + c.broker.slice(1),
        sublabel: c.clientId ?? undefined,
      }))}
    />
  );
}