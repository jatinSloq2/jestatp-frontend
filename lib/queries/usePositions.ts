import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, ApiError, BrokerName, OrderSegment, PositionRecord, SyncedPaginationMeta } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function usePositions(params: { broker: BrokerName | null; segment: OrderSegment | 'all'; page: number }) {
  return useQuery<{ data: PositionRecord[]; meta: SyncedPaginationMeta }, ApiError>({
    queryKey: queryKeys.positions.list({ broker: params.broker as BrokerName, segment: params.segment, page: params.page }),
    queryFn: () =>
      api.listPositions({
        broker: params.broker as BrokerName,
        segment: params.segment === 'all' ? undefined : params.segment,
        page: params.page,
      }),
    enabled: params.broker !== null,
    placeholderData: keepPreviousData,
  });
}
