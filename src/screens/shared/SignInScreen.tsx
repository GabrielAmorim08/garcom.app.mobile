import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { biometricLogin } from '../../entities/auth/biometricLogin';
import { getDeviceInfo } from '../../entities/auth/deviceInfo';
import { useAuthStore } from '../../entities/auth/authStore';
import { useBiometricLogin } from '../../entities/auth/useBiometricLogin';
import { ApiError } from '../../shared/api/apiError';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { AppText, Button, PasswordField, Screen } from '../../shared/components';
import { Wordmark } from '../../shared/components/Wordmark';
import { isValidDocument } from '../../shared/utils/documents';
import { maskDocument, onlyDigits } from '../../shared/utils/masks';
import { colors, radius, spacing, typography } from '../../theme';

export function SignInScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const signIn = useAuthStore(state => state.signIn);
  const isSigningIn = useAuthStore(state => state.isSigningIn);

  const biometric = useBiometricLogin();
  const autoPrompted = useRef(false);

  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function signInWith(
    digits: string,
    secret: string,
  ): Promise<'ok' | 'unauthorized' | 'failed'> {
    setError(null);
    try {
      await signIn({
        document: digits,
        password: secret,
        device: await getDeviceInfo(),
      });
      await biometricLogin.clearAutoPromptSuppression();
      return 'ok';
    } catch (caught) {
      const unauthorized = caught instanceof ApiError && caught.status === 401;
      setError(unauthorized ? t('auth.invalidCredentials') : getErrorMessage(caught, t));
      return unauthorized ? 'unauthorized' : 'failed';
    }
  }

  function offerBiometric(digits: string, secret: string) {
    Alert.alert(
      t('biometric.enableTitle', { method: biometric.methodName }),
      t('biometric.enableMessage'),
      [
        {
          text: t('biometric.enableLater'),
          style: 'cancel',
          onPress: () => void biometricLogin.rememberPromptDeclined(),
        },
        {
          text: t('biometric.enableConfirm'),
          onPress: () => void biometricLogin.enable({ document: digits, password: secret }),
        },
      ],
    );
  }

  async function handleSubmit() {
    const digits = onlyDigits(document);
    if (!digits || !password) {
      setError(t('errors.required'));
      return;
    }

    if (!isValidDocument(digits)) {
      setError(t('auth.documentInvalid'));
      return;
    }

    const offer =
      biometric.loaded && biometric.kind !== null && !biometric.enabled
      && !(await biometricLogin.wasPromptDeclined());

    if ((await signInWith(digits, password)) === 'ok' && offer) {
      offerBiometric(digits, password);
    }
  }

  const handleBiometric = useCallback(async () => {
    const stored = await biometricLogin.authenticate({
      title: t('biometric.prompt'),
      cancel: t('biometric.cancel'),
    });

    if (!stored) {
      await biometric.refresh();
      return;
    }

    if ((await signInWith(stored.document, stored.password)) === 'unauthorized') {
      await biometricLogin.disable();
      await biometric.refresh();
      setError(t('biometric.credentialsOutdated'));
    }
    // signInWith and biometric are rebuilt on every render; the callback only needs t.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const biometricReady = biometric.loaded && biometric.enabled;
  useEffect(() => {
    if (!biometricReady || autoPrompted.current) {
      return;
    }

    autoPrompted.current = true;
    void biometricLogin.isAutoPromptSuppressed().then(suppressed => {
      if (!suppressed) {
        void handleBiometric();
      }
    });
  }, [biometricReady, handleBiometric]);

  return (
    <Screen scrollable edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <Wordmark size={40} />
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
            {t('auth.document')}
          </AppText>
          <TextInput
            value={document}
            onChangeText={value => setDocument(maskDocument(value))}
            keyboardType="number-pad"
            maxLength={18}
            placeholder="000.000.000-00"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <PasswordField
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          placeholder="********"
        />

        {error ? (
          <View style={styles.error}>
            <AppText variant="captionStrong" color={colors.danger}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label={t('auth.signIn')} onPress={handleSubmit} loading={isSigningIn} />

        {biometricReady ? (
          <Button
            label={t('biometric.signInWith', { method: biometric.methodName })}
            variant="secondary"
            onPress={() => void handleBiometric()}
            disabled={isSigningIn}
          />
        ) : null}

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
    flexGrow: 1,
    justifyContent: 'center',
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
