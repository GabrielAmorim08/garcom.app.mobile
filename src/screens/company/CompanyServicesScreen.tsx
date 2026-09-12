import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { useNearbyJobPosts } from '../../entities/jobPost/useJobPosts';
import { AppText, EmptyState, ListSeparator, Screen, ScreenHeader } from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { spacing } from '../../theme';

/**
 * Requests published by the company.
 *
 * It reads the same list the waiter sees while the "my posts" endpoint is not in
 * place; swapping the hook for useMyJobPosts is the only change needed.
 */
export function CompanyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { location } = useCurrentLocation();

  const { data, isLoading, refetch, isRefetching } = useNearbyJobPosts({
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: 50_000,
  });

  const items = data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader title={t('company.home.myServices')} />

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
            <EmptyState icon="note" title={t('waiter.myServices.emptyUpcoming')} />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  loading: { paddingVertical: spacing.huge },
});
