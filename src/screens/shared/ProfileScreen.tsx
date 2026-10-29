import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { biometricLogin } from '../../entities/auth/biometricLogin';
import { useBiometricLogin } from '../../entities/auth/useBiometricLogin';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  Avatar,
  Button,
  Icon,
  StatCard,
} from '../../shared/components';
import { TabScreen } from '../../navigation/TabScreen';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { changeLanguage } from '../../i18n';
import { formatRating } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const tabBarClearance = useTabBarClearance();
  const biometric = useBiometricLogin();
  const mode = useAuthStore(state => state.mode);
  const signOut = useAuthStore(state => state.signOut);

  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();

  function confirmDisableBiometric() {
    Alert.alert(t('biometric.disableTitle'), t('biometric.disableMessage'), [
      { text: t('biometric.cancel'), style: 'cancel' },
      {
        text: t('biometric.disableConfirm'),
        style: 'destructive',
        onPress: () => {
          void biometricLogin
            .disable()
            .then(() => biometricLogin.forgetPromptDeclined())
            .then(() => biometric.refresh());
        },
      },
    ]);
  }

  function toggleLanguage() {
    void changeLanguage(i18n.language === 'pt-BR' ? 'en' : 'pt-BR');
  }

  return (
    <TabScreen title={t('tabs.profile')}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
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
          {biometric.enabled ? (
            <ProfileOption
              title={t('biometric.profileTitle')}
              subtitle={t('biometric.profileEnabled')}
              onPress={confirmDisableBiometric}
            />
          ) : null}
          <ProfileOption
            title={t('profile.language')}
            subtitle={i18n.language === 'pt-BR' ? 'English' : 'Português'}
            onPress={toggleLanguage}
          />
        </View>

        <View style={styles.signOutArea}>
          <Button
            label={t('auth.signOut')}
            variant="secondary"
            onPress={() => void signOut()}
          />
        </View>
      </ScrollView>
    </TabScreen>
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
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
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
  signOutArea: { marginTop: spacing.xl },
});
