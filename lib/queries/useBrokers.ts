import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, BrokerConnection, BrokerName } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setSelectedBroker } from '@/lib/store/brokerSlice';
import { queryKeys } from './queryKeys';

export function useSupportedBrokers() {
  return useQuery({
    queryKey: queryKeys.brokers.supported(),
    queryFn: api.listSupportedBrokers,
    staleTime: Infinity, // static catalog data — never changes at runtime
  });
}

/**
 * Fetches the user's broker connections and exposes the Redux-backed
 * `selectedBroker` alongside them — replaces the old per-page
 * `useConnectedBrokers()` local-state hook. Because the selection now lives
 * in Redux instead of each page's own `useState`, it survives navigating
 * between Orders / Positions / Holdings / Funds instead of resetting back
 * to "first connected broker" every time.
 */
export function useConnectedBrokers() {
  const dispatch = useAppDispatch();
  const selectedBroker = useAppSelector((s) => s.broker.selectedBroker);

  const query = useQuery<BrokerConnection[], ApiError>({
    queryKey: queryKeys.brokers.connections(),
    queryFn: api.listBrokerConnections,
  });

  const connectedBrokers = query.data?.filter((c) => c.status === 'connected') ?? [];

  useEffect(() => {
    // Only auto-pick a default the first time we have data and nothing is
    // selected yet — never overrides a broker the user already chose.
    if (selectedBroker === null && connectedBrokers.length > 0) {
      dispatch(setSelectedBroker(connectedBrokers[0].broker));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return {
    connections: query.data ?? null,
    connectedBrokers,
    broker: selectedBroker,
    setBroker: (broker: BrokerName) => dispatch(setSelectedBroker(broker)),
    error: query.error?.message ?? null,
    loading: query.isLoading,
  };
}

function useInvalidateBrokerConnections() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.brokers.connections() });
}

export function useConnectDhan() {
  const invalidate = useInvalidateBrokerConnections();
  return useMutation({
    mutationFn: api.connectDhan,
    onSuccess: invalidate,
  });
}

export function useZerodhaLoginUrl() {
  return useMutation({ mutationFn: api.zerodhaLoginUrl });
}

export function useConnectZerodha() {
  const invalidate = useInvalidateBrokerConnections();
  return useMutation({
    mutationFn: api.connectZerodha,
    onSuccess: invalidate,
  });
}

export function useConnectGroww() {
  const invalidate = useInvalidateBrokerConnections();
  return useMutation({
    mutationFn: api.connectGroww,
    onSuccess: invalidate,
  });
}

export function useDisconnectBroker() {
  const invalidate = useInvalidateBrokerConnections();
  return useMutation({
    mutationFn: api.disconnectBroker,
    onSuccess: invalidate,
  });
}

/** Queues a broker sync job. Callers should refetch orders/positions/etc a beat later — see useSyncAndRefetch in useOrders.ts for the pattern. */
export function useSyncBroker() {
  return useMutation({ mutationFn: api.syncBroker });
}
