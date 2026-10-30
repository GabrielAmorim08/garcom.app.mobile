import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../entities/auth/authStore';
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
        <Avatar name={user?.fullName ?? 'TaxaUp'} uri={user?.profilePhotoPath} size={32} />
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
