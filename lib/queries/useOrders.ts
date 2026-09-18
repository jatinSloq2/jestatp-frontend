import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, BrokerName, OrderRecord, OrderSegment, SyncedPaginationMeta } from '@/lib/api';
import { queryKeys } from './queryKeys';
import { useSyncBroker } from './useBrokers';

export function useOrders(params: { broker: BrokerName | null; segment: OrderSegment | 'all'; page: number }) {
  return useQuery<{ data: OrderRecord[]; meta: SyncedPaginationMeta }, ApiError>({
    queryKey: queryKeys.orders.list({ broker: params.broker as BrokerName, segment: params.segment, page: params.page }),
    queryFn: () =>
      api.listOrders({
        broker: params.broker as BrokerName,
        segment: params.segment === 'all' ? undefined : params.segment,
        page: params.page,
      }),
    enabled: params.broker !== null,
    // Keeps the previous page's rows on screen while the next page loads,
    // instead of the table flashing to a loading state on every click.
    placeholderData: keepPreviousData,
  });
}

/**
 * Queues a broker sync, then invalidates the given query key after a short
 * delay — the sync job runs asynchronously on the backend, so refetching
 * immediately would usually just show the same stale data. Matches the old
 * `syncBroker().then(() => setTimeout(load, 1500))` pattern, just centralized.
 */
export function useSyncAndRefetch(queryKeyToInvalidate: readonly unknown[]) {
  const queryClient = useQueryClient();
  const syncMutation = useSyncBroker();

  const sync = async (broker: BrokerName) => {
    await syncMutation.mutateAsync(broker);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    }, 1500);
  };

  return { sync, syncing: syncMutation.isPending };
}
