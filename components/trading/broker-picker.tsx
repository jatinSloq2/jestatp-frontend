'use client';

import { BrokerConnection, BrokerName } from '@/lib/api';
import { Select } from '@/components/ui/select';

/**
 * Re-exported here (rather than importing `lib/queries/useBrokers` directly
 * everywhere) so every existing `import { useConnectedBrokers } from
 * '@/components/trading/broker-picker'` call site keeps working unchanged.
 * The implementation now fetches via React Query (one shared, cached
 * `/brokers/connections` request instead of one per page) and stores the
 * selected broker in Redux instead of page-local `useState`, so it survives
 * navigating between Orders / Positions / Holdings / Funds.
 */
export { useConnectedBrokers } from '@/lib/queries/useBrokers';

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
