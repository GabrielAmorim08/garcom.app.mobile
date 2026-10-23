import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';
import { AppText } from './AppText';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>

      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
      />

      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputError: { borderColor: colors.danger },
});
