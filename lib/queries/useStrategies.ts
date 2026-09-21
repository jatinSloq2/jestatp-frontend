import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  ApiError,
  BrokerName,
  PaginationMeta,
  Segment,
  Strategy,
  StrategyActivity,
  StrategyInput,
  StrategyStatus,
  StrategyVersion,
} from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useIndicatorCatalog() {
  return useQuery({
    queryKey: queryKeys.strategies.indicatorCatalog(),
    queryFn: api.getIndicatorCatalog,
    staleTime: Infinity, // static metadata
  });
}

export function useStrategies(params?: { status?: StrategyStatus; segment?: Segment; page?: number; limit?: number }) {
  return useQuery<{ data: Strategy[]; meta: PaginationMeta }, ApiError>({
    queryKey: queryKeys.strategies.list(params),
    queryFn: () => api.listStrategies(params),
  });
}

export function useStrategy(id: string | null) {
  return useQuery<Strategy, ApiError>({
    queryKey: queryKeys.strategies.detail(id as string),
    queryFn: () => api.getStrategy(id as string),
    enabled: id !== null,
  });
}

export function useStrategyVersions(id: string | null) {
  return useQuery<StrategyVersion[], ApiError>({
    queryKey: queryKeys.strategies.versions(id as string),
    queryFn: () => api.listStrategyVersions(id as string),
    enabled: id !== null,
  });
}

export function useStrategyVersion(id: string | null, version: number | null) {
  return useQuery<StrategyVersion, ApiError>({
    queryKey: queryKeys.strategies.version(id as string, version as number),
    queryFn: () => api.getStrategyVersion(id as string, version as number),
    enabled: id !== null && version !== null,
  });
}

/**
 * Current live/paper execution status for this strategy — polls every 15s
 * while the strategy is active (matches roughly how often a fresh tick can
 * realistically produce a new trade) so the "are we holding a position
 * right now" panel doesn't require a manual refresh.
 */
export function useStrategyActivity(id: string | null, params?: { page?: number; limit?: number }, isActive?: boolean) {
  return useQuery<StrategyActivity, ApiError>({
    queryKey: queryKeys.strategies.activity(id as string, params),
    queryFn: () => api.getStrategyActivity(id as string, params),
    enabled: id !== null,
    refetchInterval: isActive ? 15_000 : false,
  });
}

/** Validation is re-run on demand (e.g. a "Validate" button, or before save) rather than cached — a mutation fits better than a query here. */
export function useValidateStrategy() {
  return useMutation({ mutationFn: api.validateStrategy });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createStrategy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies', 'list'] }),
  });
}

export function useUpdateStrategy(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StrategyInput>) => api.updateStrategy(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.strategies.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ['strategies', 'list'] });
    },
  });
}

function useStrategyStatusMutation(mutationFn: (id: string) => Promise<Strategy>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (updated, id) => {
      queryClient.setQueryData(queryKeys.strategies.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: ['strategies', 'list'] });
    },
  });
}

export function useActivateStrategy() {
  return useStrategyStatusMutation(api.activateStrategy);
}

export function usePauseStrategy() {
  return useStrategyStatusMutation(api.pauseStrategy);
}

export function useArchiveStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.archiveStrategy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies', 'list'] }),
  });
}

export function useDuplicateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.duplicateStrategy,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['strategies', 'list'] }),
  });
}

export function useRunBacktest(id: string) {
  return useMutation({
    mutationFn: (input: Parameters<typeof api.runBacktest>[1]) => api.runBacktest(id, input),
  });
}

export function usePreviewBacktest() {
  return useMutation({ mutationFn: api.previewBacktest });
}
