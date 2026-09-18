import { useQuery } from '@tanstack/react-query';
import { api, ApiError, BrokerName, FundRecord } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useFunds(broker: BrokerName | null) {
  return useQuery<FundRecord, ApiError>({
    queryKey: queryKeys.funds.detail(broker as BrokerName),
    queryFn: () => api.getFunds(broker as BrokerName),
    enabled: broker !== null,
  });
}
