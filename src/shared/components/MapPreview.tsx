import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera, Map, ViewAnnotation } from '@maplibre/maplibre-react-native';

import { colors, radius } from '../../theme';
import type { GeoPoint } from '../types/common';
import { Icon } from './Icon';

export interface MapMarker {
  id: string;
  location: GeoPoint;
}

interface MapPreviewProps {
  /** Where the map is centred, shown with the gold pin. */
  location: GeoPoint | null;
  height?: number;
  /** Other places on the map: the open services around the location. */
  markers?: MapMarker[];
  onMarkerPress?: (id: string) => void;
  /** Lets the user pan and zoom. Off for the small previews that sit inside a scroll. */
  interactive?: boolean;
  zoom?: number;
}

/**
 * OpenStreetMap raster tiles, which need no key. The public tile servers are meant
 * for light use, so production should point `tiles` at its own or a paid provider.
 */
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

const DEFAULT_ZOOM = 14;

/** Where the map opens before any position is known: all of Brazil, not the open ocean. */
const BRAZIL_CENTER: [number, number] = [-52, -14.5];
const BRAZIL_ZOOM = 3.2;
const CAMERA_MOVE_MS = 600;

export function MapPreview({
  location,
  height = 140,
  markers = [],
  onMarkerPress,
  interactive = false,
  zoom = DEFAULT_ZOOM,
}: MapPreviewProps) {
  return (
    <View
      style={[styles.container, { height }]}
      accessibilityLabel="mapa"
      accessibilityRole="image">
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        dragPan={interactive}
        touchZoom={interactive}
        doubleTapZoom={interactive}
        touchRotate={false}
        touchPitch={false}
        compass={false}
        logo={false}
        attribution>
        {location ? (
          <Camera
            center={[location.longitude, location.latitude]}
            zoom={zoom}
            duration={CAMERA_MOVE_MS}
          />
        ) : (
          <Camera center={BRAZIL_CENTER} zoom={BRAZIL_ZOOM} />
        )}

        {markers.map(marker => (
          <ViewAnnotation
            key={marker.id}
            id={`marker-${marker.id}`}
            lngLat={[marker.location.longitude, marker.location.latitude]}>
            <Pressable
              onPress={() => onMarkerPress?.(marker.id)}
              hitSlop={8}
              accessibilityRole="button"
              style={styles.marker}>
              <View style={styles.markerDot} />
            </Pressable>
          </ViewAnnotation>
        ))}

        {location ? (
          <ViewAnnotation
            id="focus-pin"
            anchor="bottom"
            lngLat={[location.longitude, location.latitude]}>
            <View pointerEvents="none">
              <Icon name="pin" size={32} color={colors.primary} filled />
            </View>
          </ViewAnnotation>
        ) : null}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  map: { flex: 1 },
  marker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.info,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
