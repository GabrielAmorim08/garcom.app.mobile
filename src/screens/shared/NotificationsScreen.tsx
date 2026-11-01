import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import type { AppNotification } from '../../entities/notification/types';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../entities/notification/useNotifications';
import { AppText, EmptyState, Screen, ScreenHeader } from '../../shared/components';
import { formatShortDate, formatTime } from '../../shared/utils/format';
import { colors, radius, spacing } from '../../theme';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const mode = useAuthStore(state => state.mode);
  const { data, isLoading, isRefetching, refetch } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const hasUnread = items.some(item => item.readAt === null);

  function open(item: AppNotification) {
    if (item.readAt === null) {
      markRead(item.id);
    }

    if (!item.jobPostId) {
      return;
    }

    if (mode === 'company') {
      navigation.navigate('CompanyServiceDetail', { jobPostId: item.jobPostId });
    } else {
      navigation.navigate('ServiceDetail', { jobPostId: item.jobPostId });
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title={t('notifications.title')}
        onBack={navigation.goBack}
        right={
          hasUnread ? (
            <Pressable
              onPress={() => markAllRead()}
              disabled={isMarkingAll}
              accessibilityRole="button"
              accessibilityLabel={t('notifications.markAllRead')}>
              <AppText variant="caption" color={colors.primary}>
                {t('notifications.markAllRead')}
              </AppText>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={items.length ? styles.list : styles.empty}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          ListEmptyComponent={
            <EmptyState
              icon="note"
              title={t('notifications.empty')}
              message={t('notifications.emptyHint')}
            />
          }
          renderItem={({ item }) => <NotificationRow item={item} onPress={() => open(item)} />}
        />
      )}
    </Screen>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const isUnread = item.readAt === null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.row, isUnread && styles.rowUnread]}>
      <View style={[styles.dot, isUnread ? styles.dotUnread : styles.dotRead]} />
      <View style={styles.rowText}>
        <AppText variant={isUnread ? 'bodyStrong' : 'body'}>{item.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {item.body}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {`${formatShortDate(item.createdAt)} · ${formatTime(item.createdAt)}`}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.sm },
  empty: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowUnread: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1, gap: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  dotUnread: { backgroundColor: colors.primary },
  dotRead: { backgroundColor: 'transparent' },
});
