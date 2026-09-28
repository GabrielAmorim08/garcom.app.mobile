import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { ApiError } from '../../shared/api/apiError';
import { AppText, Button, Screen } from '../../shared/components';
import { maskVerificationCode } from '../../shared/utils/masks';
import { colors, radius, spacing, typography } from '../../theme';

export function EmailVerificationScreen() {
  const { t } = useTranslation();
  const email = useAuthStore(state => state.pendingVerificationEmail);
  const verifyEmail = useAuthStore(state => state.verifyEmail);
  const resendEmailVerification = useAuthStore(state => state.resendEmailVerification);
  const signOut = useAuthStore(state => state.signOut);
  const isVerifyingEmail = useAuthStore(state => state.isVerifyingEmail);

  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (code.length !== 6) {
      setError(t('auth.emailVerificationCodeInvalid'));
      return;
    }

    setError(null);
    setMessage(null);
    try {
      await verifyEmail(code);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('errors.generic'));
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendEmailVerification();
      setMessage(t('auth.emailVerificationSent'));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('errors.generic'));
    }
  }

  return (
    <Screen scrollable edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          {t('auth.emailVerificationTitle')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t('auth.emailVerificationSubtitle', { email })}
        </AppText>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.emailVerificationCode')}
          </AppText>
          <TextInput
            value={code}
            onChangeText={value => setCode(maskVerificationCode(value))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.codeInput]}
          />
        </View>

        {message ? (
          <View style={styles.notice}>
            <AppText variant="captionStrong" color={colors.success}>
              {message}
            </AppText>
          </View>
        ) : null}

        {error ? (
          <View style={styles.error}>
            <AppText variant="captionStrong" color={colors.danger}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button
          label={t('auth.emailVerificationConfirm')}
          onPress={handleVerify}
          loading={isVerifyingEmail}
        />

        <Pressable onPress={handleResend} style={styles.link}>
          <AppText variant="bodyStrong" color={colors.primary}>
            {t('auth.emailVerificationResend')}
          </AppText>
        </Pressable>

        <Pressable onPress={signOut} style={styles.link}>
          <AppText variant="bodyStrong" color={colors.textSecondary}>
            {t('auth.useAnotherAccount')}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
    gap: spacing.xxxl,
  },
  header: {
    gap: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  codeInput: {
    textAlign: 'center',
    ...typography.title,
  },
  notice: {
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  error: {
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
