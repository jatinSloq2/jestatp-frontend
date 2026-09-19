import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  ApiError,
  BrokerName,
  PaginationMeta,
  Segment,
  Strategy,
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
    mutationFn: (input: { broker?: BrokerName; from?: string; to?: string; params?: Record<string, unknown>; warmup?: number }) =>
      api.runBacktest(id, input),
  });
}

export function usePreviewBacktest() {
  return useMutation({ mutationFn: api.previewBacktest });
}
