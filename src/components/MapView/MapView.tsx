import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Map, { Marker, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import DeckOverlay from './DeckOverlay';
import { useCOGLayer } from '@/hooks/useCOGLayer';
import { useTimeSeries } from '@/hooks/useTimeSeries';
import { setClickedLngLat } from '@/store/slices/mapSlice';
import type { AppDispatch, RootState } from '@/store/index';
import styles from './MapView.module.css';

const CARTO_DARK_MATTER =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: -96.5,
  latitude: 38.5,
  zoom: 4,
};

export default function MapView() {
  const dispatch = useDispatch<AppDispatch>();
  const clickedLngLat = useSelector((state: RootState) => state.map.clickedLngLat);
  const cogLayer = useCOGLayer();
  // Called for Redux side effects only; return value is unused.
  useTimeSeries();

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const { lng, lat } = event.lngLat;
      dispatch(setClickedLngLat([lng, lat]));
    },
    [dispatch],
  );

  return (
    <div className={styles.mapContainer}>
      <Map
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle={CARTO_DARK_MATTER}
        style={{ width: '100%', height: '100%' }}
        pitchWithRotate={false}
        dragRotate={false}
        touchZoomRotate={false}
        onClick={handleClick}
      >
        <DeckOverlay layers={cogLayer ? [cogLayer] : []} />
        {clickedLngLat && (
          <Marker longitude={clickedLngLat[0]} latitude={clickedLngLat[1]} anchor="center" style={{ pointerEvents: 'none' }}>
            <div key={clickedLngLat.join(',')} className={styles.clickMarker}>
              <div className={styles.clickMarkerPulse} />
              <div className={styles.clickMarkerDot} />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
