import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { AppText, Button, Screen } from '../../shared/components';
import { Wordmark } from '../../shared/components/Wordmark';
import { colors, spacing } from '../../theme';

/**
 * Entry point while real authentication is not wired: it picks which side of the
 * product to open. The sign-in form replaces it once the API exists.
 */
export function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const setMode = useAuthStore(state => state.setMode);

  function enterAs(mode: 'company' | 'waiter') {
    setMode(mode);
    navigation.reset({
      index: 0,
      routes: [{ name: mode === 'company' ? 'CompanyTabs' : 'WaiterTabs' }],
    });
  }

  return (
    <Screen background={colors.heroBackground} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Wordmark tone="dark" />
          <AppText variant="caption" color={colors.onHeroMuted} align="center">
            {t('common.tagline')}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button label={t('auth.iAmACompany')} onPress={() => enterAs('company')} />
          <Button
            label={t('auth.iAmAWaiter')}
            variant="secondary"
            onPress={() => enterAs('waiter')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
  },
  brand: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  actions: { gap: spacing.md },
});
