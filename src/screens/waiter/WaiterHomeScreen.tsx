import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { useNearbyJobPosts } from '../../entities/jobPost/useJobPosts';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import { MapPreview, SegmentedControl, StatCard } from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { firstName, formatRating } from '../../shared/utils/format';
import { spacing } from '../../theme';
import { TabScreen } from '../../navigation/TabScreen';

type ViewMode = 'map' | 'list';

export function WaiterHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const { location } = useCurrentLocation({ autoRequest: true });

  const [viewMode, setViewMode] = useState<ViewMode>('map');

  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();
  const { data: nearby } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: profile?.searchRadiusMeters ?? 10_000,
  });

  const closest = nearby?.items[0];
  const markers = (nearby?.items ?? []).flatMap(item =>
    item.location ? [{ id: item.id, location: item.location }] : [],
  );

  return (
    <TabScreen
      title={t('waiter.home.greeting', { name: firstName(user?.fullName ?? '') })}
      subtitle={t('waiter.home.subtitle')}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + tabBarClearance }]}
        showsVerticalScrollIndicator={false}>
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
            <MapPreview
              location={location}
              height={200}
              markers={markers}
              onMarkerPress={jobPostId => navigation.navigate('ServiceDetail', { jobPostId })}
            />
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
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  stats: { flexDirection: 'row', gap: spacing.md },
  mapBlock: { gap: spacing.md },
  listBlock: { gap: spacing.md },
});
