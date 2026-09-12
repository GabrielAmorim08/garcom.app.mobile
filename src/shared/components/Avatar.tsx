import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';
import { initials } from '../utils/format';
import { AppText } from './AppText';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
}

/** Photo when there is one, initials on a gold wash when there is not. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const dimension = { width: size, height: size, borderRadius: radius.pill };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, dimension]}
        accessibilityIgnoresInvertColors
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimension]} accessibilityLabel={name}>
      <AppText variant="captionStrong" color={colors.primaryPressed}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceAlt },
  fallback: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
