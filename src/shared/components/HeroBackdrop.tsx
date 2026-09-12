import React from 'react';
import { ImageSourcePropType, ImageBackground, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '../../theme';

interface HeroBackdropProps {
  children: React.ReactNode;
  /**
   * Cover photo. Until the brand photography is chosen, the painted fallback below
   * carries the same dark, warm mood, so no screen depends on a missing asset.
   */
  image?: ImageSourcePropType;
}

export function HeroBackdrop({ children, image }: HeroBackdropProps) {
  if (image) {
    return (
      <ImageBackground source={image} style={styles.fill} resizeMode="cover">
        <View style={styles.scrim}>{children}</View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.fill}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="warmGlow" cx="78%" cy="18%" r="85%">
            <Stop offset="0" stopColor={colors.primary} stopOpacity={0.38} />
            <Stop offset="1" stopColor={colors.heroBackground} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#warmGlow)" />
        <Circle cx="18%" cy="72%" r="90" fill={colors.primary} opacity={0.08} />
        <Circle cx="88%" cy="58%" r="130" fill={colors.primary} opacity={0.06} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { flex: 1, backgroundColor: colors.overlay },
});
