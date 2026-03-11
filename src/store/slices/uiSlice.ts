import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TempUnit = 'C' | 'F';

interface UiState {
  tempUnit: TempUnit;
}

const initialState: UiState = {
  tempUnit: 'F',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTempUnit(state, action: PayloadAction<TempUnit>) {
      state.tempUnit = action.payload;
    },
  },
});

export const { setTempUnit } = uiSlice.actions;
export default uiSlice.reducer;
