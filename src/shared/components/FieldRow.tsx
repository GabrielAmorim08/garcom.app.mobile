import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

interface FieldRowProps {
  icon: IconName;
  label: string;
  value?: string | null;
  placeholder?: string;
  onPress?: () => void;
}

/** Read-only field that opens a picker: icon, small label, current value. */
export function FieldRow({ icon, label, value, placeholder, onPress }: FieldRowProps) {
  const hasValue = Boolean(value);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value ?? placeholder ?? ''}`}
      style={({ pressed }) => [styles.container, pressed && onPress ? styles.pressed : null]}>
      <Icon name={icon} size={20} color={colors.textMuted} />
      <View style={styles.texts}>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText
          variant="body"
          color={hasValue ? colors.textPrimary : colors.textMuted}
          numberOfLines={2}>
          {value ?? placeholder ?? '-'}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  texts: { flex: 1, gap: 1 },
});
