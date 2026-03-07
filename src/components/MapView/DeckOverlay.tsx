import { useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { MapboxOverlayProps } from '@deck.gl/mapbox';

/**
 * Thin wrapper that registers a MapboxOverlay as a MapLibre control via
 * react-map-gl's useControl hook. Renders nothing itself.
 *
 * Usage (inside a react-map-gl <Map>):
 *   <DeckOverlay layers={cogLayer ? [cogLayer] : []} />
 */
export default function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay({ interleaved: true, ...props }),
  );
  overlay.setProps(props);
  return null;
}
