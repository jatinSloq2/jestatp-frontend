import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, CustomIndicator, CustomIndicatorInput, CustomIndicatorTestResult } from '@/lib/api';
import { queryKeys } from './queryKeys';

export function useCustomIndicators() {
  return useQuery<{ data: CustomIndicator[]; meta: unknown }, ApiError>({
    queryKey: queryKeys.customIndicators.all(),
    queryFn: () => api.listCustomIndicators({ limit: 100 }),
  });
}

export function useCustomIndicator(id: string | null) {
  return useQuery<CustomIndicator, ApiError>({
    queryKey: queryKeys.customIndicators.detail(id as string),
    queryFn: () => api.getCustomIndicator(id as string),
    enabled: id !== null,
  });
}

export function useCreateCustomIndicator() {
  const queryClient = useQueryClient();
  return useMutation<CustomIndicator, ApiError, CustomIndicatorInput>({
    mutationFn: (input) => api.createCustomIndicator(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customIndicators.all() }),
  });
}

export function useUpdateCustomIndicator() {
  const queryClient = useQueryClient();
  return useMutation<CustomIndicator, ApiError, { id: string; input: Partial<CustomIndicatorInput> }>({
    mutationFn: ({ id, input }) => api.updateCustomIndicator(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customIndicators.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.customIndicators.detail(id) });
    },
  });
}

export function useDeleteCustomIndicator() {
  const queryClient = useQueryClient();
  return useMutation<{ id: string }, ApiError, string>({
    mutationFn: (id) => api.deleteCustomIndicator(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.customIndicators.all() }),
  });
}

/** Not cached (queryKey includes nothing stable) — this is a "run it now" action, always mutation-shaped even though it doesn't change server state, since the Studio's Validate/Test button is explicitly user-triggered rather than something to keep fresh in the background. */
export function useTestCustomIndicator() {
  return useMutation<CustomIndicatorTestResult, ApiError, Parameters<typeof api.testCustomIndicator>[0]>({
    mutationFn: (input) => api.testCustomIndicator(input),
  });
}
