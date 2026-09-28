import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { useNearbyJobPosts } from '../../entities/jobPost/useJobPosts';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import {
  AppText,
  Avatar,
  MapPreview,
  Screen,
  SegmentedControl,
  StatCard,
} from '../../shared/components';
import { Wordmark } from '../../shared/components/Wordmark';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import type { GeoPoint } from '../../shared/types/common';
import { firstName, formatRating } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type ViewMode = 'map' | 'list';

export function WaiterHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { location } = useCurrentLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();
  const { data: nearby } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: profile?.searchRadiusMeters ?? 10_000,
  });

  const closest = nearby?.items[0];
  const markers = (nearby?.items ?? [])
    .map(item => item.location)
    .filter((point): point is GeoPoint => point !== null);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Wordmark size={20} />
        <Avatar name={user?.fullName ?? 'ServeUp'} uri={user?.profilePhotoPath} size={32} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <AppText variant="title">
            {t('waiter.home.greeting', { name: firstName(user?.fullName ?? '') })}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {t('waiter.home.subtitle')}
          </AppText>
        </View>

        <View style={styles.stats}>
          <StatCard
            value={String(profile?.completedServices ?? 0)}
            label={t('waiter.home.servicesDone')}
          />
          <StatCard
            value={formatRating(profile?.averageRating ?? 0)}
            label={t('waiter.home.averageRating')}
            withStar
          />
        </View>

        <SegmentedControl<ViewMode>
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'map', label: t('common.map') },
            { value: 'list', label: t('common.list') },
          ]}
        />

        {viewMode === 'map' ? (
          <View style={styles.mapBlock}>
            <MapPreview location={location} height={200} markers={markers} />
            {closest ? (
              <JobPostCard
                jobPost={closest}
                onPress={() =>
                  navigation.navigate('ServiceDetail', { jobPostId: closest.id })
                }
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.listBlock}>
            {(nearby?.items ?? []).map(item => (
              <JobPostCard
                key={item.id}
                jobPost={item}
                onPress={() => navigation.navigate('ServiceDetail', { jobPostId: item.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  greeting: { gap: 2 },
  stats: { flexDirection: 'row', gap: spacing.md },
  mapBlock: { gap: spacing.md },
  listBlock: { gap: spacing.md },
});
