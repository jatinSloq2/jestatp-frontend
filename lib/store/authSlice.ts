import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/lib/api';

interface AuthState {
  user: User | null;
  /**
   * React Query owns the actual fetching/caching of `/auth/me` (see
   * `lib/queries/useAuth.ts`) — this slice just mirrors the result so any
   * component can read "who's logged in" via `useAppSelector` without
   * threading a `user` prop through every page and layout component.
   */
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoading(state) {
      state.status = 'loading';
    },
    setCurrentUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    updateCurrentUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearCurrentUser(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
  },
});

export const { authLoading, setCurrentUser, updateCurrentUser, clearCurrentUser } = authSlice.actions;
export default authSlice.reducer;
