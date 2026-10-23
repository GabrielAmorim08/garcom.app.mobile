import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Icon,
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
  const signOut = useAuthStore(state => state.signOut);

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
          <Avatar name={user?.fullName ?? 'ServeUp'} uri={user?.profilePhotoPath} size={64} />
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

        <View style={styles.options}>
          <ProfileOption
            title={t('profile.registrationData')}
            subtitle={t('profile.registrationDataHint')}
            onPress={() => navigation.navigate('ProfileDetails')}
          />
          {mode === 'waiter' ? (
            <ProfileOption
              title={t('waiter.profileEdit.title')}
              subtitle={
                profile?.canReceivePayouts
                  ? t('waiter.profileEdit.pixTitle')
                  : t('waiter.profileEdit.pixMissing')
              }
              onPress={() => navigation.navigate('WaiterProfileEdit')}
            />
          ) : null}
          <ProfileOption
            title={mode === 'company' ? t('auth.iAmAWaiter') : t('auth.iAmACompany')}
            subtitle={t('profile.switchModeHint')}
            onPress={switchMode}
          />
          <ProfileOption
            title={t('profile.language')}
            subtitle={i18n.language === 'pt-BR' ? 'English' : 'Português'}
            onPress={toggleLanguage}
          />
        </View>

        <Card style={styles.supportCard}>
          <AppText variant="bodyStrong">{t('profile.accountStatus')}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {user?.status ?? '-'}
          </AppText>
        </Card>

        <View style={styles.signOutArea}>
          <Button
            label={t('auth.signOut')}
            variant="secondary"
            onPress={() => void signOut()}
          />
        </View>
      </View>
    </Screen>
  );
}

interface ProfileOptionProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ProfileOption({ title, subtitle, onPress }: ProfileOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.option, pressed ? styles.optionPressed : null]}>
      <View style={styles.optionTexts}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {subtitle}
        </AppText>
      </View>
      <Icon name="chevronRight" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityTexts: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', gap: spacing.md },
  options: { gap: spacing.md },
  option: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionPressed: { backgroundColor: colors.surfaceAlt },
  optionTexts: { flex: 1, gap: spacing.xs },
  supportCard: { gap: spacing.xs },
  signOutArea: { marginTop: spacing.xl },
});
