/**
 * Format a longitude/latitude pair as a human-readable string.
 * e.g. formatLngLat(-112.5, 48.2) → "48.2°N, 112.5°W"
 */
export function formatLngLat(lng: number, lat: number): string {
  const latStr = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}

import { GRID_WIDTH, GRID_HEIGHT } from '@/config/dataConfig';

/** nClimGrid grid origin and pixel size from gdalinfo.
 *  Origin is the upper-left corner of the upper-left pixel.
 */
export const ORIGIN_LON = -124.70833333;
export const ORIGIN_LAT = 49.37500127;
export const PIXEL_WIDTH = 0.04166667; // degrees per pixel (east)
export const PIXEL_HEIGHT = -0.04166667; // degrees per pixel (south, negative)

/**
 * Convert a clicked longitude/latitude to a [row, col] index into the
 * Zarr array. The Zarr array dimension order is [time, lat/row, lon/col].
 *
 * @returns [row, col] zero-based pixel indices, or null if outside the grid
 */
export function lngLatToZarrIndex(lng: number, lat: number): [number, number] | null {
  const col = Math.floor((lng - ORIGIN_LON) / PIXEL_WIDTH);
  const row = Math.floor((lat - ORIGIN_LAT) / PIXEL_HEIGHT);
  if (col < 0 || col >= GRID_WIDTH || row < 0 || row >= GRID_HEIGHT) return null;
  return [row, col];
}
