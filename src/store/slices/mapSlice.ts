import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MapState {
  clickedLngLat: [number, number] | null;
}

const initialState: MapState = {
  clickedLngLat: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setClickedLngLat(state, action: PayloadAction<[number, number]>) {
      state.clickedLngLat = action.payload;
    },
    clearClickedLngLat(state) {
      state.clickedLngLat = null;
    },
  },
});

export const { setClickedLngLat, clearClickedLngLat } = mapSlice.actions;
export default mapSlice.reducer;
