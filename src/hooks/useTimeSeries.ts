import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as zarrita from 'zarrita';
import type { RootState, AppDispatch } from '@/store/index';
import { setData, setLoading, setError } from '@/store/slices/timeSeriesSlice';
import { lngLatToZarrIndex } from '@/utils/coordinates';
import { DATA_BUCKET_URL, ZARR_PATH, DATE_BOUNDS } from '@/config/dataConfig';
import type { TimeSeriesPoint } from '@/types/index';

/**
 * Watches the Redux clicked location; when it changes, fetches the full
 * time series from Zarr and writes the result back to Redux.
 */
export function useTimeSeries(): void {
  const dispatch = useDispatch<AppDispatch>();
  const clickedLngLat = useSelector((state: RootState) => state.map.clickedLngLat);

  useEffect(() => {
    if (!clickedLngLat) return;

    const [lng, lat] = clickedLngLat;
    const zarrIndex = lngLatToZarrIndex(lng, lat);

    if (!zarrIndex) {
      // Click was outside the CONUS grid — clear existing data, no fetch needed
      dispatch(setData(null));
      dispatch(setError(null));
      return;
    }

    const [row, col] = zarrIndex;
    let cancelled = false;

    dispatch(setLoading(true));

    (async () => {
      const store = new zarrita.FetchStore(`${DATA_BUCKET_URL}/${ZARR_PATH}`);
      // zarrita.open returns a broad union type. Cast to the concrete float32 array type —
      // there is no runtime instanceof equivalent for zarrita.Array, so this cast is
      // intentional. A dtype mismatch would surface as NaN values or a downstream error.
      // Use open.v3 directly to avoid the V2 fallback, which fetches .zattrs —
      // S3 returns 403 (not 404) for missing keys, causing zarrita to throw.
      const arr = (await zarrita.open.v3(store, { kind: 'array' })) as zarrita.Array<
        'float32',
        typeof store
      >;

      // null selects the entire time axis; integer indices collapse the spatial axes.
      // Result: Chunk<'float32'> with shape [T] and data Float32Array[T].
      const chunk = await zarrita.get(arr, [null, row, col]);

      if (cancelled) return;

      if (!(chunk.data instanceof Float32Array)) {
        throw new Error(
          `Expected Float32Array chunk data; got ${Object.prototype.toString.call(chunk.data)}`,
        );
      }
      const rawData = chunk.data;
      const points: TimeSeriesPoint[] = Array.from(rawData, (val, t) => ({
        year: Math.floor(t / 12) + DATE_BOUNDS.startYear,
        month: (t % 12) + 1,
        tempC: isNaN(val) ? null : val,
      }));

      dispatch(setData(points));
      dispatch(setError(null));
      dispatch(setLoading(false));
    })().catch((err: unknown) => {
      if (!cancelled) {
        console.error('Zarr time series fetch failed:', err);
        dispatch(setError('Failed to load temperature data.'));
        dispatch(setLoading(false));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clickedLngLat, dispatch]);
}
