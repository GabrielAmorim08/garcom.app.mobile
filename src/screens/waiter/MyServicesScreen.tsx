import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AssignmentRow } from '../../entities/jobAssignment/components/AssignmentRow';
import {
  useAssignmentHistory,
  useMonthEarnings,
  useUpcomingAssignments,
} from '../../entities/jobAssignment/useJobAssignments';
import {
  AppText,
  Card,
  EmptyState,
  ListSeparator,
  Screen,
  ScreenHeader,
  SegmentedControl,
} from '../../shared/components';
import { formatCurrency } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type Tab = 'upcoming' | 'history';

export function MyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [tab, setTab] = useState<Tab>('upcoming');

  const upcoming = useUpcomingAssignments();
  const history = useAssignmentHistory();
  const { data: earnings } = useMonthEarnings();

  const active = tab === 'upcoming' ? upcoming : history;
  const items = active.data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader title={t('waiter.myServices.title')} onBack={navigation.goBack} />

      <View style={styles.switcher}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'upcoming', label: t('waiter.myServices.upcoming') },
            { value: 'history', label: t('waiter.myServices.history') },
          ]}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onRefresh={active.refetch}
        refreshing={active.isRefetching}
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => (
          <AssignmentRow
            assignment={item}
            onPress={() =>
              navigation.navigate('ServiceDetail', { jobPostId: item.jobPostId })
            }
          />
        )}
        ListEmptyComponent={
          active.isLoading ? (
            <AppText variant="caption" align="center" style={styles.loading}>
              {t('common.loading')}
            </AppText>
          ) : (
            <EmptyState
              icon="note"
              title={
                tab === 'upcoming'
                  ? t('waiter.myServices.emptyUpcoming')
                  : t('waiter.myServices.emptyHistory')
              }
            />
          )
        }
        ListFooterComponent={
          tab !== 'upcoming' || !earnings ? undefined : (
            <Card style={styles.earnings}>
              <AppText variant="caption" color={colors.textMuted}>
                {t('waiter.myServices.monthEarnings')}
              </AppText>
              <AppText variant="price" color={colors.primaryPressed}>
                {formatCurrency(earnings.totalAmount, earnings.currency)}
              </AppText>
            </Card>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  loading: { paddingVertical: spacing.huge },
  earnings: { marginTop: spacing.xl, gap: spacing.xxs },
});
