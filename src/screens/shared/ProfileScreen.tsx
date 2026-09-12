import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Screen,
  ScreenHeader,
  StatCard,
} from '../../shared/components';
import { changeLanguage } from '../../i18n';
import { formatRating } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const mode = useAuthStore(state => state.mode);
  const setMode = useAuthStore(state => state.setMode);

  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();

  function toggleLanguage() {
    void changeLanguage(i18n.language === 'pt-BR' ? 'en' : 'pt-BR');
  }

  function switchMode() {
    const next = mode === 'company' ? 'waiter' : 'company';
    setMode(next);
    navigation.reset({
      index: 0,
      routes: [{ name: next === 'company' ? 'CompanyTabs' : 'WaiterTabs' }],
    });
  }

  return (
    <Screen scrollable>
      <ScreenHeader title={t('tabs.profile')} />

      <View style={styles.content}>
        <View style={styles.identity}>
          <Avatar name={user?.fullName ?? 'ServeUp'} uri={user?.profilePhotoUrl} size={64} />
          <View style={styles.identityTexts}>
            <AppText variant="subtitle">{user?.fullName ?? '-'}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {user?.email ?? '-'}
            </AppText>
          </View>
        </View>

        {mode === 'waiter' && profile ? (
          <View style={styles.stats}>
            <StatCard
              value={String(profile.completedServices)}
              label={t('waiter.home.servicesDone')}
            />
            <StatCard
              value={formatRating(profile.averageRating)}
              label={t('waiter.home.averageRating')}
              withStar
            />
          </View>
        ) : null}

        <Card style={styles.actions}>
          <Button
            label={mode === 'company' ? t('auth.iAmAWaiter') : t('auth.iAmACompany')}
            variant="secondary"
            size="md"
            onPress={switchMode}
          />
          <Button
            label={i18n.language === 'pt-BR' ? 'English' : 'Português'}
            variant="ghost"
            size="md"
            onPress={toggleLanguage}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityTexts: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', gap: spacing.md },
  actions: { gap: spacing.sm },
});
