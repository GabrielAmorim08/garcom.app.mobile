import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { useNearbyJobPosts } from '../../entities/jobPost/useJobPosts';
import { useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  EmptyState,
  ListSeparator,
  Icon,
  MapPreview,
  SegmentedControl,
} from '../../shared/components';
import { TabScreen } from '../../navigation/TabScreen';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { colors, radius, spacing } from '../../theme';

type ViewMode = 'map' | 'list';

export function NearbyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const { location } = useCurrentLocation({ autoRequest: true });

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data: profile } = useWaiterProfile();
  const { data, isLoading, refetch, isRefetching } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: profile?.searchRadiusMeters ?? 10_000,
  });

  const items = data?.items ?? [];

  return (
    <TabScreen title={t('waiter.nearby.title')}>
      <View style={styles.switcher}>
        <View style={styles.switcherControl}>
          <SegmentedControl<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'map', label: t('common.map') },
              { value: 'list', label: t('common.list') },
            ]}
          />
        </View>

        <Pressable
          style={styles.filterButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.filter')}>
          <Icon name="filter" size={16} color={colors.textSecondary} />
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('common.filter')}
          </AppText>
        </Pressable>
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <MapPreview
            location={location}
            height={360}
            interactive
            markers={items.flatMap(item =>
              item.location ? [{ id: item.id, location: item.location }] : [],
            )}
            onMarkerPress={jobPostId => navigation.navigate('ServiceDetail', { jobPostId })}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: spacing.xxl + tabBarClearance },
          ]}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ListSeparator}
          renderItem={({ item }) => (
            <JobPostCard
              jobPost={item}
              onPress={() => navigation.navigate('ServiceDetail', { jobPostId: item.id })}
            />
          )}
          ListEmptyComponent={
            isLoading ? (
              <AppText variant="caption" align="center" style={styles.loading}>
                {t('common.loading')}
              </AppText>
            ) : (
              <EmptyState
                title={t('waiter.nearby.empty')}
                message={t('waiter.nearby.emptyHint')}
              />
            )
          }
        />
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  switcherControl: { flex: 1 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  mapWrapper: { paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl },
  loading: { paddingVertical: spacing.huge },
});
