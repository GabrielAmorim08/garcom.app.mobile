import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { colors, radius } from '../../theme';
import type { GeoPoint } from '../types/common';
import { Icon } from './Icon';

interface MapPreviewProps {
  location: GeoPoint | null;
  height?: number;
  /** Extra pins for the nearby map: the other open services. */
  markers?: GeoPoint[];
}

/**
 * Stand-in for the real map.
 *
 * react-native-maps needs a Google Maps key and native configuration on both
 * platforms, so the whole app is kept free of that dependency until the key
 * exists: swapping this one file for a MapView is the entire migration.
 */
export function MapPreview({ location, height = 140, markers = [] }: MapPreviewProps) {
  return (
    <View
      style={[styles.container, { height }]}
      accessibilityLabel="map preview"
      accessibilityRole="image">
      <Svg width="100%" height="100%">
        <Rect x={0} y={0} width="100%" height="100%" fill={colors.surfaceAlt} />

        {/* Stylised street grid, so the block reads as a map and not as a loading box. */}
        <Line x1="0%" y1="32%" x2="100%" y2="26%" stroke={colors.border} strokeWidth={6} />
        <Line x1="0%" y1="72%" x2="100%" y2="78%" stroke={colors.border} strokeWidth={4} />
        <Line x1="24%" y1="0%" x2="30%" y2="100%" stroke={colors.border} strokeWidth={5} />
        <Line x1="70%" y1="0%" x2="64%" y2="100%" stroke={colors.border} strokeWidth={3} />

        {markers.map((_, index) => (
          <Circle
            key={index}
            cx={`${20 + index * 18}%`}
            cy={`${35 + (index % 3) * 18}%`}
            r={6}
            fill={colors.info}
            opacity={0.75}
          />
        ))}
      </Svg>

      {location ? (
        <View style={styles.pin}>
          <Icon name="pin" size={28} color={colors.primary} filled />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  pin: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
