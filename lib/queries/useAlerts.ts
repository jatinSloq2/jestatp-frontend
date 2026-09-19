import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, AlertRecord, AlertsPaginationMeta, ApiError } from '@/lib/api';
import { queryKeys } from './queryKeys';

/**
 * Polls every 30s so a rejected live order shows up on the bell without
 * requiring a page refresh — cheap enough (one lightweight COUNT-backed
 * query) to poll continuously while the app is open.
 */
export function useAlerts(params?: { unacknowledged?: boolean; page?: number; limit?: number }) {
  const query = useQuery<{ data: AlertRecord[]; meta: AlertsPaginationMeta }, ApiError>({
    queryKey: queryKeys.alerts.list(params),
    queryFn: () => api.listAlerts(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  });

  return {
    alerts: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    unacknowledgedCount: query.data?.meta.unacknowledgedCount ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation<AlertRecord, ApiError, string>({
    mutationFn: (id) => api.acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.alerts.all() });
    },
  });
}
