import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
}

/** The "- 2 +" control used for the number of waiters. */
export function Stepper({ value, onChange, min = 1, max = 99, accessibilityLabel }: StepperProps) {
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <StepperButton
        icon="minus"
        disabled={!canDecrease}
        onPress={() => onChange(value - 1)}
        label="decrease"
      />
      <AppText variant="subtitle" align="center" style={styles.value}>
        {String(value)}
      </AppText>
      <StepperButton
        icon="plus"
        disabled={!canIncrease}
        onPress={() => onChange(value + 1)}
        label="increase"
      />
    </View>
  );
}

interface StepperButtonProps {
  icon: 'plus' | 'minus';
  disabled: boolean;
  onPress: () => void;
  label: string;
}

function StepperButton({ icon, disabled, onPress, label }: StepperButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}>
      <Icon name={icon} size={18} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.4 },
  value: { minWidth: 32 },
});
