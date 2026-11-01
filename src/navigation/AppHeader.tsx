import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../entities/auth/authStore';
import { useMyCompany } from '../entities/company/useCompany';
import { useUnreadNotificationCount } from '../entities/notification/useNotifications';
import { useCurrentUser } from '../entities/user/useUser';
import { AppText, Avatar, Icon } from '../shared/components';
import { Wordmark } from '../shared/components/Wordmark';
import { colors, hitSlop, spacing } from '../theme';

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
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
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
      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={t('notifications.title')}>
          <Icon name="bell" size={24} color={colors.textOnDark} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <AppText variant="caption" color={colors.textOnDark} style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : String(unreadCount)}
              </AppText>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          onPress={openProfile}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel={t('tabs.profile')}>
          <Avatar name={avatarName} uri={avatarUri} size={32} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
