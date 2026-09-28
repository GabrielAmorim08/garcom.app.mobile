import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getDeviceInfo } from '../../entities/auth/deviceInfo';
import { useAuthStore } from '../../entities/auth/authStore';
import { ApiError } from '../../shared/api/apiError';
import { AppText, Button, Screen } from '../../shared/components';
import { Wordmark } from '../../shared/components/Wordmark';
import { colors, radius, spacing, typography } from '../../theme';

export function SignInScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const signIn = useAuthStore(state => state.signIn);
  const isSigningIn = useAuthStore(state => state.isSigningIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setError(t('errors.required'));
      return;
    }

    setError(null);
    try {
      await signIn({
        email: email.trim(),
        password,
        device: await getDeviceInfo(),
      });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('errors.generic'));
    }
  }

  return (
    <Screen scrollable edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <Wordmark tone="dark" />
        <AppText variant="title" align="center">
          {t('auth.signInTitle')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t('auth.signInSubtitle')}
        </AppText>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.email')}
          </AppText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="voce@email.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.password')}
          </AppText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            placeholder="********"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        {error ? (
          <View style={styles.error}>
            <AppText variant="captionStrong" color={colors.danger}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label={t('auth.signIn')} onPress={handleSubmit} loading={isSigningIn} />

        <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.link}>
          <AppText variant="bodyStrong" color={colors.primary}>
            {t('auth.noAccount')}
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
