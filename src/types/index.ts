export interface TimeSeriesPoint {
  year: number;
  month: number;
  /** Temperature in °C, or null for NoData pixels */
  tempC: number | null;
}
