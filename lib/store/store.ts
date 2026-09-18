import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import brokerReducer from './brokerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    broker: brokerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
