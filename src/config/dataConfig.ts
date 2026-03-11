/** Single source of truth for all infrastructure URLs and date bounds.
 *  No other file should reference import.meta.env directly.
 */
function requireEnv(name: string): string {
  const val = import.meta.env[name] as string | undefined;
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

export const DATA_BUCKET_URL = requireEnv('VITE_DATA_BUCKET_URL');
export const ZARR_PATH = requireEnv('VITE_ZARR_PATH');
export const COG_PATH = requireEnv('VITE_COG_PATH');

/** nClimGrid CONUS grid dimensions in pixels. */
export const GRID_WIDTH = 1385;
export const GRID_HEIGHT = 596;

/** nClimGrid date bounds (inclusive) */
export const DATE_BOUNDS = {
  startYear: 1895,
  startMonth: 1,
  endYear: 2026,
  endMonth: 2,
} as const;
