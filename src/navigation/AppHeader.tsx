import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../entities/auth/authStore';
import { useMyCompany } from '../entities/company/useCompany';
import { useCurrentUser } from '../entities/user/useUser';
import { Avatar } from '../shared/components';
import { Wordmark } from '../shared/components/Wordmark';
import { hitSlop } from '../theme';

/**
 * The top row of every main screen: the logo on the left and the user's avatar on
 * the right, which opens the profile tab of whichever side of the app is active.
 * Meant for a dark surface.
 */
export function AppHeader() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const mode = useAuthStore(state => state.mode);
  const { data: user } = useCurrentUser();
  const { data: company } = useMyCompany(mode === 'company');
  const avatarName = mode === 'company' ? company?.tradeName ?? user?.fullName ?? 'TaxaUp' : user?.fullName ?? 'TaxaUp';
  const avatarUri = mode === 'company' ? company?.logoPath ?? user?.profilePhotoPath : user?.profilePhotoPath;

  function openProfile() {
    if (mode === 'company') {
      navigation.navigate('CompanyTabs', { screen: 'CompanyProfile' });
    } else {
      navigation.navigate('WaiterTabs', { screen: 'WaiterProfile' });
    }
  }

  return (
    <View style={styles.row}>
      <Wordmark tone="dark" size={20} />
      <Pressable
        onPress={openProfile}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={t('tabs.profile')}>
        <Avatar name={avatarName} uri={avatarUri} size={32} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
