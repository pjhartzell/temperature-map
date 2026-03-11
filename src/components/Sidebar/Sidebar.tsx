import { useDispatch, useSelector } from 'react-redux';
import OverlayCard from '@/components/OverlayCard/OverlayCard';
import TimeSeriesCard from '@/components/TimeSeriesCard/TimeSeriesCard';
import { setTempUnit } from '@/store/slices/uiSlice';
import type { AppDispatch, RootState } from '@/store/index';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const tempUnit = useSelector((state: RootState) => state.ui.tempUnit);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.headerCard}>
        <div className={styles.headerRow}>
          <h1 className={styles.appTitle}>Temperature Map</h1>
          <div className={styles.unitToggle}>
            <button
              className={`${styles.unitBtn} ${tempUnit === 'C' ? styles.unitBtnActive : ''}`}
              onClick={() => dispatch(setTempUnit('C'))}
              aria-pressed={tempUnit === 'C'}
            >
              °C
            </button>
            <button
              className={`${styles.unitBtn} ${tempUnit === 'F' ? styles.unitBtnActive : ''}`}
              onClick={() => dispatch(setTempUnit('F'))}
              aria-pressed={tempUnit === 'F'}
            >
              °F
            </button>
          </div>
        </div>
        <a
          href="https://www.ncei.noaa.gov/access/metadata/landing-page/bin/iso?id=gov.noaa.ncdc:C00332"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attributionLink}
        >
          NOAA nClimGrid Monthly Dataset
        </a>
      </div>
      <OverlayCard />
      <TimeSeriesCard />
    </aside>
  );
}
