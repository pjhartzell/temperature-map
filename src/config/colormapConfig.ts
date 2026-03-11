/** Color stretch parameters for the COG overlay.
 *  These are the only values that control how raw float32 temperatures
 *  map to colors on the GPU. Adjust min/max to change the displayed range.
 */

/** Minimum temperature (°C) mapped to the cool end of the colormap */
export const COLORMAP_MIN_TEMP_C = -30;

/** Maximum temperature (°C) mapped to the warm end of the colormap */
export const COLORMAP_MAX_TEMP_C = 40;

/** Linear normalize: maps a temperature value to [0, 1] */
export function normalizeTemp(tempC: number): number {
  return (tempC - COLORMAP_MIN_TEMP_C) / (COLORMAP_MAX_TEMP_C - COLORMAP_MIN_TEMP_C);
}

// Three-stop blue → near-white → red ramp
const STOPS: [number, number, number][] = [
  [33, 102, 172], // t=0: blue (#2166ac)
  [247, 247, 247], // t=0.5: near-white
  [214, 96, 77], // t=1: red (#d6604d)
];

/** Maps t ∈ [0,1] to an RGBA tuple using the blue→white→red ramp. */
export function colormapRgba(t: number): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  let r: number, g: number, b: number;
  if (clamped <= 0.5) {
    const u = clamped / 0.5;
    r = Math.round(STOPS[0][0] + u * (STOPS[1][0] - STOPS[0][0]));
    g = Math.round(STOPS[0][1] + u * (STOPS[1][1] - STOPS[0][1]));
    b = Math.round(STOPS[0][2] + u * (STOPS[1][2] - STOPS[0][2]));
  } else {
    const u = (clamped - 0.5) / 0.5;
    r = Math.round(STOPS[1][0] + u * (STOPS[2][0] - STOPS[1][0]));
    g = Math.round(STOPS[1][1] + u * (STOPS[2][1] - STOPS[1][1]));
    b = Math.round(STOPS[1][2] + u * (STOPS[2][2] - STOPS[1][2]));
  }
  return [r, g, b, 220];
}

/** Generates a CSS linear-gradient string sampling the colormap at 11 stops. */
export function colormapCssGradient(): string {
  const stops = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const [r, g, b, a] = colormapRgba(t);
    const pct = Math.round(t * 100);
    return `rgba(${r},${g},${b},${(a / 255).toFixed(2)}) ${pct}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
