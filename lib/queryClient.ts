import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

function shouldRetry(failureCount: number, error: unknown): boolean {
  // Retrying a 4xx (bad request, unauthenticated, not found, validation) just
  // repeats the same failure — only retry on transient/server-side errors.
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
