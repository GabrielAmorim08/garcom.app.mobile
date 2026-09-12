import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, spacing } from '../../theme';
import { AppText } from './AppText';

interface WordmarkProps {
  tone?: 'light' | 'dark';
  size?: number;
}

/**
 * "ServeUp" with the bow tie under it. Drawn rather than shipped as an image so it
 * stays crisp at any size and can flip colour with the surface it sits on.
 */
export function Wordmark({ tone = 'light', size = 28 }: WordmarkProps) {
  const color = tone === 'dark' ? colors.textOnDark : colors.textPrimary;

  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel="ServeUp">
      <AppText variant="title" color={color} style={{ fontSize: size, lineHeight: size * 1.15 }}>
        ServeUp
      </AppText>
      <BowTie width={size * 1.4} color={colors.primary} />
    </View>
  );
}

function BowTie({ width, color }: { width: number; color: string }) {
  const height = width * 0.42;

  return (
    <Svg width={width} height={height} viewBox="0 0 48 20">
      <Path d="M2 3.5 20 10 2 16.5Z" fill={color} />
      <Path d="M46 3.5 28 10l18 6.5Z" fill={color} />
      <Path d="M20 6.5h8v7h-8Z" fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.xs },
});
