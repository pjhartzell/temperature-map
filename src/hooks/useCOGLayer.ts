import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BitmapLayer } from '@deck.gl/layers';
import { fromUrl } from 'geotiff';
import { DATA_BUCKET_URL, COG_PATH, GRID_WIDTH, GRID_HEIGHT } from '@/config/dataConfig';
import { ORIGIN_LON, ORIGIN_LAT, PIXEL_WIDTH, PIXEL_HEIGHT } from '@/utils/coordinates';
import { formatEpochKey } from '@/utils/dateHelpers';
import { colormapRgba, normalizeTemp } from '@/config/colormapConfig';
import { setLoading, setError } from '@/store/slices/overlaySlice';
import type { AppDispatch, RootState } from '@/store/index';

// nClimGrid CONUS geographic bounds [west, south, east, north] in EPSG:4326.
// Derived from grid origin, pixel size, and grid dimensions — all from shared constants.
const COG_BOUNDS: [number, number, number, number] = [
  ORIGIN_LON, // west
  ORIGIN_LAT + GRID_HEIGHT * PIXEL_HEIGHT, // south (PIXEL_HEIGHT is negative)
  ORIGIN_LON + GRID_WIDTH * PIXEL_WIDTH, // east
  ORIGIN_LAT, // north
];

const R_EARTH = 6378137; // WGS84 semi-major axis (meters)

function mercatorY(latDeg: number): number {
  const latRad = (latDeg * Math.PI) / 180;
  return R_EARTH * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

/**
 * Re-samples a lat/lon-linear Float32 band into Mercator-y-linear spacing.
 *
 * BitmapLayer stretches images linearly between the supplied geographic bounds.
 * The MapLibre basemap uses Web Mercator, so northern latitudes occupy more
 * screen pixels than an equal degree span at southern latitudes. Without
 * correction the overlay drifts up to ~250 km off at higher latitudes over
 * CONUS. Pre-warping to Mercator spacing cancels the distortion: the linear
 * BitmapLayer stretch in lat/lon space combined with the Mercator screen
 * projection leaves the image correctly registered.
 */
function warpToMercator(
  band: Float32Array,
  width: number,
  height: number,
  northDeg: number,
  southDeg: number,
): Float32Array {
  const warped = new Float32Array(width * height);
  const yMercNorth = mercatorY(northDeg);
  const yMercSouth = mercatorY(southDeg);
  const northRad = (northDeg * Math.PI) / 180;
  const southRad = (southDeg * Math.PI) / 180;

  for (let row = 0; row < height; row++) {
    // Mercator y for this output row (row 0 = north edge, row height = south edge)
    const yMerc = yMercNorth - (row / height) * (yMercNorth - yMercSouth);
    // Latitude at this Mercator y position
    const latRad = 2 * Math.atan(Math.exp(yMerc / R_EARTH)) - Math.PI / 2;
    // Fractional source row (0 = north, height = south)
    const srcRowF = ((northRad - latRad) / (northRad - southRad)) * height;
    const r0 = Math.max(0, Math.min(height - 1, Math.floor(srcRowF)));
    const r1 = Math.max(0, Math.min(height - 1, r0 + 1));
    const t = srcRowF - Math.floor(srcRowF);

    for (let col = 0; col < width; col++) {
      const v0 = band[r0 * width + col];
      const v1 = band[r1 * width + col];
      if (isNaN(v0) && isNaN(v1)) {
        warped[row * width + col] = NaN;
      } else if (isNaN(v0)) {
        warped[row * width + col] = v1;
      } else if (isNaN(v1)) {
        warped[row * width + col] = v0;
      } else {
        warped[row * width + col] = v0 * (1 - t) + v1 * t;
      }
    }
  }

  return warped;
}

export function useCOGLayer(): BitmapLayer | null {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, year, month, opacity } = useSelector((state: RootState) => state.overlay);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    if (!enabled) {
      setImageData(null);
      return;
    }

    const controller = new AbortController();
    const url = `${DATA_BUCKET_URL}/${COG_PATH}/nclimgrid-tavg-${formatEpochKey(year, month)}.tif`;

    dispatch(setLoading(true));

    (async () => {
      const tiff = await fromUrl(url, {}, controller.signal);
      const image = await tiff.getImage();
      const rasters = await image.readRasters({ signal: controller.signal });

      const band = rasters[0];
      if (!(band instanceof Float32Array)) {
        throw new Error(
          `Expected Float32Array raster band; got ${Object.prototype.toString.call(band)}`,
        );
      }
      const width = image.getWidth();
      const height = image.getHeight();

      const warped = warpToMercator(band, width, height, COG_BOUNDS[3], COG_BOUNDS[1]);

      const rgba = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const val = warped[i];
        if (isNaN(val)) {
          rgba[i * 4 + 3] = 0;
        } else {
          const [r, g, b, a] = colormapRgba(normalizeTemp(val));
          rgba[i * 4] = r;
          rgba[i * 4 + 1] = g;
          rgba[i * 4 + 2] = b;
          rgba[i * 4 + 3] = a;
        }
      }

      if (!controller.signal.aborted) {
        setImageData(new ImageData(rgba, width, height));
        dispatch(setError(null));
        dispatch(setLoading(false));
      }
    })().catch((err: unknown) => {
      if (!controller.signal.aborted) {
        console.error('COG load failed:', err);
        setImageData(null);
        dispatch(setError('No data available for this date.'));
        dispatch(setLoading(false));
      }
    });

    return () => controller.abort();
  }, [enabled, year, month, dispatch]);

  const layer = useMemo(
    () =>
      imageData
        ? new BitmapLayer({
            id: 'cog-bitmap',
            image: imageData,
            bounds: COG_BOUNDS,
            opacity,
            textureParameters: {
              minFilter: 'nearest',
              magFilter: 'nearest',
            },
          })
        : null,
    [imageData, opacity],
  );

  return layer;
}
