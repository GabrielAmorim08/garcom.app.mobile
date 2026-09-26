import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, palette, radius } from '../../theme';
import { Icon } from './Icon';

interface SuccessSealProps {
  size?: number;
  tone?: 'gold' | 'success';
}

/** The round confirmation mark on the "Solicitação enviada" screen. */
export function SuccessSeal({ size = 88, tone = 'gold' }: SuccessSealProps) {
  const background = tone === 'gold' ? colors.primary : colors.success;

  return (
    <View
      style={[styles.circle, { width: size, height: size, backgroundColor: background }]}
      accessibilityRole="image"
      accessibilityLabel="sucesso">
      <Icon name="check" size={size * 0.42} color={palette.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
