import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { JobPostCard } from '../../entities/jobPost/components/JobPostCard';
import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';
import { AppText, EmptyState, ListSeparator, Screen, ScreenHeader } from '../../shared/components';
import { spacing } from '../../theme';

export function CompanyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { data, isLoading, refetch, isRefetching } = useMyJobPosts();

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
            onPress={() => navigation.navigate('CompanyServiceDetail', { jobPostId: item.id })}
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
