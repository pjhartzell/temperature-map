import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DATE_BOUNDS } from '../../config/dataConfig';

interface OverlayState {
  enabled: boolean;
  year: number;
  month: number;
  loading: boolean;
  opacity: number;
  error: string | null;
}

const initialState: OverlayState = {
  enabled: true,
  year: DATE_BOUNDS.endYear,
  month: DATE_BOUNDS.endMonth,
  loading: false,
  opacity: 0.5,
  error: null,
};

const overlaySlice = createSlice({
  name: 'overlay',
  initialState,
  reducers: {
    setEnabled(state, action: PayloadAction<boolean>) {
      state.enabled = action.payload;
    },
    setYear(state, action: PayloadAction<number>) {
      state.year = action.payload;
    },
    setMonth(state, action: PayloadAction<number>) {
      state.month = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setOpacity(state, action: PayloadAction<number>) {
      state.opacity = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setEnabled, setYear, setMonth, setLoading, setOpacity, setError } = overlaySlice.actions;
export default overlaySlice.reducer;
