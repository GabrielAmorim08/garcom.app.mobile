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
  Screen,
  SegmentedControl,
} from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import type { GeoPoint } from '../../shared/types/common';
import { colors, radius, spacing } from '../../theme';

type ViewMode = 'map' | 'list';

export function NearbyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { location } = useCurrentLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const { data: profile } = useWaiterProfile();
  const { data, isLoading, refetch, isRefetching } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: profile?.searchRadiusMeters ?? 10_000,
  });

  const items = data?.items ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <AppText variant="subtitle">{t('waiter.nearby.title')}</AppText>
          <View style={styles.cityRow}>
            <Icon name="pin" size={14} color={colors.textMuted} />
            <AppText variant="caption" color={colors.textMuted}>
              São Paulo - SP
            </AppText>
          </View>
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

      <View style={styles.switcher}>
        <SegmentedControl<ViewMode>
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'map', label: t('common.map') },
            { value: 'list', label: t('common.list') },
          ]}
        />
      </View>

      {viewMode === 'map' ? (
        <View style={styles.mapWrapper}>
          <MapPreview
            location={location}
            height={320}
            markers={items
              .map(item => item.location)
              .filter((point): point is GeoPoint => point !== null)}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  titleBlock: { flex: 1, gap: 2 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
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
  switcher: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  mapWrapper: { paddingHorizontal: spacing.xl },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  loading: { paddingVertical: spacing.huge },
});
