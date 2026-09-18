import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError, Session, User } from '@/lib/api';
import { useAppDispatch } from '@/lib/store/hooks';
import { updateCurrentUser } from '@/lib/store/authSlice';
import { queryKeys } from './queryKeys';

/**
 * Mirrors the `useCurrentUser` pattern in `useAuth.ts`: on success we both
 * update the React Query cache for `auth.me` and patch the Redux `auth.user`
 * mirror, so `DashboardShell`/nav bars reflect the new name immediately
 * without waiting for a refetch.
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    return useMutation<User, ApiError, { fullName: string }>({
        mutationFn: api.updateProfile,
        onSuccess: (updated) => {
            queryClient.setQueryData(queryKeys.auth.me(), updated);
            dispatch(updateCurrentUser(updated));
        },
    });
}

export function useSessions() {
    return useQuery<Session[], ApiError>({
        queryKey: queryKeys.auth.sessions(),
        queryFn: api.sessions,
    });
}

export function useTotpSetup() {
    return useMutation({ mutationFn: api.totpSetup });
}

export function useEmailTwoFaSetup() {
    return useMutation({ mutationFn: api.emailTwoFaSetup });
}

/** Enabling either 2FA method changes `user.twoFactorEnabled`/`twoFactorMethod`, so refetch `auth.me` afterwards. */
function useRefetchCurrentUser() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
}

export function useTotpEnable() {
    const refetchUser = useRefetchCurrentUser();
    return useMutation({
        mutationFn: api.totpEnable,
        onSuccess: refetchUser,
    });
}

export function useEmailTwoFaEnable() {
    const refetchUser = useRefetchCurrentUser();
    return useMutation({
        mutationFn: api.emailTwoFaEnable,
        onSuccess: refetchUser,
    });
}

export function useDisable2fa() {
    const refetchUser = useRefetchCurrentUser();
    return useMutation({
        mutationFn: api.disable2fa,
        onSuccess: refetchUser,
    });
}

export function useLogoutAll() {
    return useMutation({ mutationFn: api.logoutAll });
}