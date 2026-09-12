import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Drops the inner padding for cards that hold a map or a full-bleed image. */
  flush?: boolean;
  selected?: boolean;
}

export function Card({ children, onPress, style, flush = false, selected = false }: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        !flush && styles.padded,
        selected && styles.selected,
        style,
      ]}>
      {children}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  padded: { padding: spacing.lg },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  pressed: { opacity: 0.85 },
});
