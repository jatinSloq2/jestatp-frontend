import { useQuery } from '@tanstack/react-query';
import { api, ApiError, BrokerName, IndexUnderlying, OptionChain } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useOptionChainExpiries(broker: BrokerName | null, underlying: IndexUnderlying) {
  return useQuery<string[], ApiError>({
    queryKey: queryKeys.optionChain.expiries(broker as BrokerName, underlying),
    queryFn: () => api.getOptionChainExpiries(broker as BrokerName, underlying),
    enabled: broker !== null,
    staleTime: 60_000, // expiries don't change intraday
  });
}

/**
 * Polls the live chain on an interval. Dhan's native option-chain endpoint
 * is rate-limited to one unique request every 3 seconds per underlying+
 * expiry (see app/trading/dhan.py) — 5s keeps every broker comfortably
 * under whatever their equivalent limit is without the page feeling stale.
 */
export function useOptionChain(broker: BrokerName | null, underlying: IndexUnderlying, expiry: string | null) {
  return useQuery<OptionChain, ApiError>({
    queryKey: queryKeys.optionChain.detail(broker as BrokerName, underlying, expiry),
    queryFn: () => api.getOptionChain(broker as BrokerName, underlying, expiry ?? undefined),
    enabled: broker !== null,
    staleTime: 4_000,
    refetchInterval: 5_000,
    // A transient bad tick shouldn't spam retries against a rate-limited endpoint.
    retry: 1,
  });
}
