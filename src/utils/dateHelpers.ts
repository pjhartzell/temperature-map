import { DATE_BOUNDS } from '@/config/dataConfig';

export interface SelectOption<T> {
  value: T;
  label: string;
}

/** All valid years in the nClimGrid dataset, ascending */
export function getYearOptions(): SelectOption<number>[] {
  const options: SelectOption<number>[] = [];
  for (let y = DATE_BOUNDS.startYear; y <= DATE_BOUNDS.endYear; y++) {
    options.push({ value: y, label: String(y) });
  }
  return options;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** All 12 months as dropdown options (1-indexed value) */
export function getMonthOptions(): SelectOption<number>[] {
  return MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }));
}

/** Format a year + 1-indexed month into the COG filename suffix, e.g. "192501" */
export function formatEpochKey(year: number, month: number): string {
  return `${year}${String(month).padStart(2, '0')}`;
}
