import type { TempUnit } from '@/store/slices/uiSlice';
import { colormapCssGradient } from '@/config/colormapConfig';
import styles from './Legend.module.css';

interface LegendProps {
  minTemp: number;
  maxTemp: number;
  unit: TempUnit;
}

export default function Legend({ minTemp, maxTemp, unit }: LegendProps) {
  const label = unit === 'F' ? '°F' : '°C';
  return (
    <div className={styles.legend}>
      <div
        className={styles.ramp}
        style={{ background: colormapCssGradient() }}
        aria-hidden="true"
      />
      <div className={styles.labels}>
        <span>{Math.round(minTemp)}{label}</span>
        <span>{Math.round(maxTemp)}{label}</span>
      </div>
    </div>
  );
}
