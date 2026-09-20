import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, User } from '@/lib/api';
import { useAppDispatch } from '@/lib/store/hooks';
import { authLoading, setCurrentUser, clearCurrentUser } from '@/lib/store/authSlice';
import { queryKeys } from './queryKeys';

/**
 * Fetches the current user (GET /auth/me) and keeps the Redux `auth` slice
 * in sync so `DashboardShell`, nav bars, etc. can read `useAppSelector(s =>
 * s.auth.user)` directly instead of every page fetching + prop-drilling its
 * own `user`. React Query still owns the actual request/cache/retry logic —
 * Redux here is purely a mirror for cross-component reads.
 *
 * Redirects to /login on a 401, matching the old `useUser()` behavior.
 */
export function useCurrentUser() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const query = useQuery<User, ApiError>({
    queryKey: queryKeys.auth.me(),
    queryFn: api.me,
    retry: false,
  });

  useEffect(() => {
    if (query.isFetching) dispatch(authLoading());
  }, [query.isFetching, dispatch]);

  useEffect(() => {
    if (query.data) dispatch(setCurrentUser(query.data));
  }, [query.data, dispatch]);

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      dispatch(clearCurrentUser());
      router.replace('/login');
    }
  }, [query.error, dispatch, router]);

  return {
    user: query.data ?? null,
    loading: query.isLoading,
    error: query.error && query.error.status !== 401 ? query.error.message : null,
    refresh: () => query.refetch(),
  };
}

/** Clears both the React Query cache and the Redux auth slice, then redirects to /login. */
export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSettled: () => {
      // "Settled" (not just onSuccess) — if the session cookie is already
      // gone server-side, logout can 401, but the client-side effect (clear
      // local state, go to /login) should happen either way.
      dispatch(clearCurrentUser());
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useLogin() {
  return useMutation({ mutationFn: api.login });
}

export function useRegister() {
  return useMutation({ mutationFn: api.register });
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: api.verifyEmail });
}

export function useResendVerification() {
  return useMutation({ mutationFn: api.resendVerification });
}

export function useVerifyLogin2fa() {
  return useMutation({ mutationFn: api.verifyLogin2fa });
}

export function useResendLogin2fa() {
  return useMutation({ mutationFn: api.resendLogin2fa });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: api.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: api.resetPassword });
}