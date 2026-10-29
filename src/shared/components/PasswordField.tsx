import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, hitSlop, radius, spacing, typography } from '../../theme';
import { AppText } from './AppText';

interface PasswordFieldProps extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label: string;
  error?: boolean;
}

/** A password input with a "Mostrar/Ocultar" switch, so a typo can be checked by eye. */
export function PasswordField({ label, error = false, ...inputProps }: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>

      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Pressable
          onPress={() => setVisible(current => !current)}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={visible ? t('common.hidePassword') : t('common.showPassword')}>
          <AppText variant="captionStrong" color={colors.primary}>
            {visible ? t('common.hidePassword') : t('common.showPassword')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  fieldError: { borderColor: colors.danger },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
});
