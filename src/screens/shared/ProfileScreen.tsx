import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';

import { useAuthStore } from '../../entities/auth/authStore';
import { biometricLogin } from '../../entities/auth/biometricLogin';
import { useBiometricLogin } from '../../entities/auth/useBiometricLogin';
import { useUploadCompanyLogo, useMyCompany } from '../../entities/company/useCompany';
import { useCurrentUser, useUploadProfilePhoto, useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  Avatar,
  Button,
  ConfirmDialog,
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
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();
  const { data: company } = useMyCompany(mode === 'company');
  const { mutateAsync: uploadProfilePhoto, isPending: isUploadingProfilePhoto } = useUploadProfilePhoto();
  const { mutateAsync: uploadCompanyLogo, isPending: isUploadingCompanyLogo } = useUploadCompanyLogo();

  const isCompany = mode === 'company';
  const profileName = isCompany ? company?.tradeName ?? company?.legalName ?? user?.fullName ?? 'TaxaUp' : user?.fullName ?? 'TaxaUp';
  const profilePhoto = isCompany ? company?.logoPath ?? user?.profilePhotoPath : user?.profilePhotoPath;
  const isUploadingPhoto = isUploadingProfilePhoto || isUploadingCompanyLogo;

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

  async function selectPhoto() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    try {
      const file = {
        uri: asset.uri,
        type: asset.type ?? 'image/jpeg',
        name: asset.fileName ?? `taxaup-${Date.now()}.jpg`,
      };
      if (isCompany && company) {
        await uploadCompanyLogo(file);
      } else {
        await uploadProfilePhoto(file);
      }
      Alert.alert(t('common.appName'), t('profile.photoUpdated'));
    } catch {
      Alert.alert(t('common.appName'), t('profile.photoError'));
    }
  }

  return (
    <TabScreen title={t('tabs.profile')}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Avatar name={profileName} uri={profilePhoto} size={64} />
          <View style={styles.identityTexts}>
            <AppText variant="subtitle">{profileName}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {isCompany ? company?.email ?? user?.email ?? '-' : user?.email ?? '-'}
            </AppText>
            <Pressable
              onPress={() => void selectPhoto()}
              disabled={isUploadingPhoto}
              accessibilityRole="button"
              style={({ pressed }) => [styles.changePhoto, pressed ? styles.changePhotoPressed : null]}>
              <AppText variant="captionStrong" color={colors.primaryPressed}>
                {isUploadingPhoto
                  ? t('common.loading')
                  : t(isCompany ? 'profile.changeCompanyLogo' : 'profile.changePhoto')}
              </AppText>
            </Pressable>
          </View>
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          {t('profile.photoHint')}
        </AppText>

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
            onPress={() => setConfirmingSignOut(true)}
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmingSignOut}
        title={t('dialogs.signOut.title')}
        message={t('dialogs.signOut.message')}
        confirmLabel={t('dialogs.signOut.confirm')}
        destructive
        onConfirm={() => {
          setConfirmingSignOut(false);
          void signOut();
        }}
        onCancel={() => setConfirmingSignOut(false)}
      />
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
  changePhoto: { alignSelf: 'flex-start', paddingTop: spacing.xs },
  changePhotoPressed: { opacity: 0.65 },
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
