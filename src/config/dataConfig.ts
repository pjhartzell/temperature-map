/** Single source of truth for all infrastructure URLs and date bounds. */

export const DATA_BUCKET_URL = 'https://temperature-map.com';
export const ZARR_PATH = 'data/nclimgrid.zarr';
export const COG_PATH = 'data/cogs';

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
