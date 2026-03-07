import { useDispatch, useSelector } from 'react-redux';
import Legend from '@/components/Legend/Legend';
import { setEnabled, setYear, setMonth, setOpacity } from '@/store/slices/overlaySlice';
import { getYearOptions, getMonthOptions } from '@/utils/dateHelpers';
import { COLORMAP_MIN_TEMP_C, COLORMAP_MAX_TEMP_C } from '@/config/colormapConfig';
import { convertTemp } from '@/utils/temperatureUtils';
import type { AppDispatch, RootState } from '@/store/index';
import styles from './OverlayCard.module.css';

const yearOptions = getYearOptions();
const monthOptions = getMonthOptions();

export default function OverlayCard() {
  const dispatch = useDispatch<AppDispatch>();
  const { enabled, year, month, loading, opacity, error } = useSelector((state: RootState) => state.overlay);
  const tempUnit = useSelector((state: RootState) => state.ui.tempUnit);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Overlay
          <span className={styles.info} data-tooltip="Monthly average temperature">ⓘ</span>
        </h2>
        <div className={styles.toggleGroup}>
          {loading && <span className={styles.spinner} aria-label="Loading" />}
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => dispatch(setEnabled(e.target.checked))}
            />
            <span className={styles.toggleTrack}>
              <span className={styles.toggleThumb} />
            </span>
          </label>
        </div>
      </div>
      <div className={`${styles.controls} ${!enabled ? styles.dimmed : ''}`}>
        <div className={styles.dateRow}>
          <select
            value={year}
            onChange={(e) => dispatch(setYear(Number(e.target.value)))}
            disabled={!enabled}
            className={styles.select}
            aria-label="Year"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => dispatch(setMonth(Number(e.target.value)))}
            disabled={!enabled}
            className={styles.select}
            aria-label="Month"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <div className={`${styles.opacityRow} ${!enabled ? styles.dimmed : ''}`}>
        <label className={styles.opacityLabel}>
          Opacity
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(e) => dispatch(setOpacity(Number(e.target.value) / 100))}
            disabled={!enabled}
            className={styles.opacitySlider}
            aria-label="Overlay opacity"
            style={{ '--fill': `${Math.round(opacity * 100)}%` } as React.CSSProperties}
          />
        </label>
      </div>
      <div className={`${styles.legend} ${!enabled ? styles.dimmed : ''}`}>
        <Legend
          minTemp={convertTemp(COLORMAP_MIN_TEMP_C, tempUnit)}
          maxTemp={convertTemp(COLORMAP_MAX_TEMP_C, tempUnit)}
          unit={tempUnit}
        />
      </div>
    </section>
  );
}
