import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TimeSeriesPoint } from '@/types/index';

interface TimeSeriesState {
  data: TimeSeriesPoint[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: TimeSeriesState = {
  data: null,
  loading: false,
  error: null,
};

const timeSeriesSlice = createSlice({
  name: 'timeSeries',
  initialState,
  reducers: {
    setData(state, action: PayloadAction<TimeSeriesPoint[] | null>) {
      state.data = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setData, setLoading, setError } = timeSeriesSlice.actions;
export default timeSeriesSlice.reducer;
