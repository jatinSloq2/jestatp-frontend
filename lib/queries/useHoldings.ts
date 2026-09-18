import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, ApiError, BrokerName, HoldingRecord, SyncedPaginationMeta } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useHoldings(params: { broker: BrokerName | null; page: number }) {
  return useQuery<{ data: HoldingRecord[]; meta: SyncedPaginationMeta }, ApiError>({
    queryKey: queryKeys.holdings.list({ broker: params.broker as BrokerName, page: params.page }),
    queryFn: () => api.listHoldings({ broker: params.broker as BrokerName, page: params.page }),
    enabled: params.broker !== null,
    placeholderData: keepPreviousData,
  });
}
