import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { AppText, Button, CodeInput, Icon, Screen } from '../../shared/components';
import { colors, radius, spacing } from '../../theme';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerificationScreen() {
  const { t } = useTranslation();
  const email = useAuthStore(state => state.pendingVerificationEmail);
  const verifyEmail = useAuthStore(state => state.verifyEmail);
  const resendEmailVerification = useAuthStore(state => state.resendEmailVerification);
  const signOut = useAuthStore(state => state.signOut);
  const isVerifyingEmail = useAuthStore(state => state.isVerifyingEmail);

  const [code, setCode] = useState('');
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  async function handleVerify() {
    if (code.length !== CODE_LENGTH) {
      setError(t('auth.emailVerificationCodeInvalid'));
      return;
    }

    setError(null);
    setMessage(null);
    try {
      await verifyEmail(code);
    } catch (caught) {
      setError(getErrorMessage(caught, t));
    }
  }

  async function handleResend() {
    setError(null);
    try {
      await resendEmailVerification();
      setCode('');
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      setMessage(t('auth.emailVerificationSent'));
    } catch (caught) {
      setError(getErrorMessage(caught, t));
    }
  }

  return (
    <Screen scrollable edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          {t('auth.emailVerificationTitle')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t('auth.emailVerificationSentTo')}
        </AppText>

        <View style={styles.emailPill} accessibilityLabel={email ?? undefined}>
          <Icon name="message" size={18} color={colors.primaryPressed} />
          <AppText variant="bodyStrong" color={colors.primaryPressed} style={styles.emailText}>
            {email}
          </AppText>
        </View>

        <AppText variant="body" color={colors.textSecondary} align="center">
          {t('auth.emailVerificationFinish')}
        </AppText>
      </View>

      <View style={styles.form}>
        <CodeInput
          label={t('auth.emailVerificationCode')}
          value={code}
          onChange={setCode}
          length={CODE_LENGTH}
          error={error !== null}
        />

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

        <Pressable onPress={handleResend} disabled={resendSeconds > 0} style={styles.link}>
          <AppText
            variant="bodyStrong"
            color={resendSeconds > 0 ? colors.textMuted : colors.primary}>
            {resendSeconds > 0
              ? t('auth.emailVerificationResendIn', { seconds: resendSeconds })
              : t('auth.emailVerificationResend')}
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
    alignItems: 'center',
    gap: spacing.md,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emailText: { flexShrink: 1 },
  form: {
    gap: spacing.lg,
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
