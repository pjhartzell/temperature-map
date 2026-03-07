import type { TempUnit } from '@/store/slices/uiSlice';

export function celsiusToFahrenheit(c: number): number {
  return c * 9 / 5 + 32;
}

export function convertTemp(c: number, unit: TempUnit): number {
  return unit === 'F' ? celsiusToFahrenheit(c) : c;
}
