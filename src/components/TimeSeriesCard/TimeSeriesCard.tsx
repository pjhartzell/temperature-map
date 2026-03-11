import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { RootState } from '@/store/index';
import { DATE_BOUNDS } from '@/config/dataConfig';
import { convertTemp } from '@/utils/temperatureUtils';
import { formatLngLat } from '@/utils/coordinates';
import styles from './TimeSeriesCard.module.css';

export default function TimeSeriesCard() {
  const { data, loading, error } = useSelector((state: RootState) => state.timeSeries);
  const overlayEnabled = useSelector((state: RootState) => state.overlay.enabled);
  const overlayYear = useSelector((state: RootState) => state.overlay.year);
  const tempUnit = useSelector((state: RootState) => state.ui.tempUnit);
  const clickedLngLat = useSelector((state: RootState) => state.map.clickedLngLat);

  const annualData = useMemo(() => {
    if (!data) return null;
    const byYear = new Map<number, number[]>();
    for (const pt of data) {
      if (pt.tempC === null) continue;
      const bucket = byYear.get(pt.year) ?? [];
      bucket.push(pt.tempC);
      byYear.set(pt.year, bucket);
    }
    const sorted = Array.from(byYear.entries())
      .sort(([a], [b]) => a - b)
      .filter(([yr]) => yr < DATE_BOUNDS.endYear || (DATE_BOUNDS.endMonth as number) === 12)
      .map(([yr, temps]) => ({
        year: yr,
        temp:
          temps.length > 0
            ? convertTemp(temps.reduce((s, v) => s + v, 0) / temps.length, tempUnit)
            : null,
      }));

    const WINDOW = 15; // ±15 years → 31-point centered moving average
    return sorted.map((pt, i, arr) => {
      const slice = arr.slice(Math.max(0, i - WINDOW), i + WINDOW + 1);
      const valid = slice.filter((p) => p.temp !== null) as { year: number; temp: number }[];
      return {
        ...pt,
        tempSmoothed:
          valid.length >= WINDOW
            ? valid.reduce((s, p) => s + p.temp, 0) / valid.length
            : null,
      };
    });
  }, [data, tempUnit]);

  const unitLabel = tempUnit === 'F' ? '°F' : '°C';

  let content: React.ReactNode;

  if (loading && !annualData) {
    content = <p className={styles.emptyText}>Loading…</p>;
  } else if (!annualData) {
    content = (
      <p className={error ? styles.errorText : styles.emptyText}>
        {error ?? 'Click anywhere on the map to view a temperature trend'}
      </p>
    );
  } else {
    content = (
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={annualData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <XAxis
              dataKey="year"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickCount={6}
              allowDecimals={false}
              tick={{ fontSize: '0.6875rem', fill: 'var(--color-text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: '0.6875rem', fill: 'var(--color-text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickFormatter={(v: number) => `${Math.round(v)}°`}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-primary)',
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} ${unitLabel}`,
                name === 'temp' ? 'Annual avg' : '30-yr trend',
              ]}
              labelFormatter={(label: number) => String(label)}
            />
            {overlayEnabled && (
              <ReferenceLine
                x={overlayYear}
                stroke="var(--color-accent)"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}
            <Line
              type="monotone"
              dataKey="temp"
              dot={false}
              stroke="#d6604d"
              strokeWidth={1.5}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="tempSmoothed"
              dot={false}
              stroke="#f4a261"
              strokeWidth={2}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Trend
          <span className={styles.info} data-tooltip="Annual average temperature">ⓘ</span>
        </h2>
      </div>
      {content}
      {annualData && (
        <p className={styles.hint}>
          {clickedLngLat ? `${formatLngLat(clickedLngLat[0], clickedLngLat[1])} · ` : ''}Click the map to update
        </p>
      )}
    </section>
  );
}
