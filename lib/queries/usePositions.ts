import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, ApiError, BrokerName, OrderSegment, PositionRecord, SyncedPaginationMeta } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function usePositions(params: { broker: BrokerName | null; segment: OrderSegment | 'all'; page: number; limit?: number }) {
  return useQuery<{ data: PositionRecord[]; meta: SyncedPaginationMeta }, ApiError>({
    queryKey: queryKeys.positions.list({
      broker: params.broker as BrokerName,
      segment: params.segment,
      page: params.page,
      limit: params.limit,
    }),
    queryFn: () =>
      api.listPositions({
        broker: params.broker as BrokerName,
        segment: params.segment === 'all' ? undefined : params.segment,
        page: params.page,
        limit: params.limit,
      }),
    enabled: params.broker !== null,
    placeholderData: keepPreviousData,
  });
}
