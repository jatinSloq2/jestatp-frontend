import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrokerName } from '@/lib/api';

interface BrokerState {
  /**
   * The broker the Orders/Positions/Holdings/Funds pages should show.
   * Previously this lived as local `useState` inside each page (via
   * `useConnectedBrokers()`), so switching from Orders to Positions reset it
   * back to "first connected broker" every time. Lifting it to Redux makes
   * the choice persist across the whole session.
   */
  selectedBroker: BrokerName | null;
}

const initialState: BrokerState = {
  selectedBroker: null,
};

const brokerSlice = createSlice({
  name: 'broker',
  initialState,
  reducers: {
    setSelectedBroker(state, action: PayloadAction<BrokerName | null>) {
      state.selectedBroker = action.payload;
    },
  },
});

export const { setSelectedBroker } = brokerSlice.actions;
export default brokerSlice.reducer;
