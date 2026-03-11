import { configureStore } from '@reduxjs/toolkit';
import mapReducer from './slices/mapSlice';
import overlayReducer from './slices/overlaySlice';
import timeSeriesReducer from './slices/timeSeriesSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    overlay: overlayReducer,
    timeSeries: timeSeriesReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
