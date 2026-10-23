import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ApplicationRow } from '../../entities/jobApplication/components/ApplicationRow';
import {
  useMyApplications,
  useWithdrawApplication,
} from '../../entities/jobApplication/useWaiterApplications';
import type { JobApplicationWithPost } from '../../entities/jobApplication/types';
import { AssignmentRow } from '../../entities/jobAssignment/components/AssignmentRow';
import type { JobAssignmentWithPost } from '../../entities/jobAssignment/types';
import {
  useAssignmentHistory,
  useMonthEarnings,
  useUpcomingAssignments,
} from '../../entities/jobAssignment/useJobAssignments';
import type { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../shared/api/errorMessage';
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

type Tab = 'upcoming' | 'applications' | 'history';

export function MyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'MyServices'>>();

  const [tab, setTab] = useState<Tab>(params?.tab ?? 'upcoming');
  const [error, setError] = useState<string | null>(null);

  const upcoming = useUpcomingAssignments();
  const history = useAssignmentHistory();
  const applications = useMyApplications();
  const { data: earnings } = useMonthEarnings();
  const { mutateAsync: withdraw, isPending: isWithdrawing, variables } = useWithdrawApplication();

  const active = tab === 'upcoming' ? upcoming : tab === 'history' ? history : applications;

  async function withdrawApplication(application: JobApplicationWithPost) {
    setError(null);

    try {
      await withdraw({ applicationId: application.id, jobPostId: application.jobPostId });
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }

  function emptyTitle(): string {
    if (tab === 'upcoming') {
      return t('waiter.myServices.emptyUpcoming');
    }

    return tab === 'history'
      ? t('waiter.myServices.emptyHistory')
      : t('waiter.myServices.emptyApplications');
  }

  const data: Array<JobAssignmentWithPost | JobApplicationWithPost> = active.data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader title={t('waiter.myServices.title')} onBack={navigation.goBack} />

      <View style={styles.switcher}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={next => {
            setError(null);
            setTab(next);
          }}
          options={[
            { value: 'upcoming', label: t('waiter.myServices.upcoming') },
            { value: 'applications', label: t('waiter.myServices.applications') },
            { value: 'history', label: t('waiter.myServices.history') },
          ]}
        />
      </View>

      {error ? (
        <AppText variant="caption" color={colors.danger} align="center" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onRefresh={active.refetch}
        refreshing={active.isRefetching}
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) =>
          tab === 'applications' ? (
            <ApplicationRow
              application={item as JobApplicationWithPost}
              isWithdrawing={isWithdrawing && variables?.applicationId === item.id}
              onPress={() => navigation.navigate('ServiceDetail', { jobPostId: item.jobPostId })}
              onWithdraw={() => withdrawApplication(item as JobApplicationWithPost)}
            />
          ) : (
            <AssignmentRow
              assignment={item as JobAssignmentWithPost}
              onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item.id })}
            />
          )
        }
        ListEmptyComponent={
          active.isLoading ? (
            <AppText variant="caption" align="center" style={styles.loading}>
              {t('common.loading')}
            </AppText>
          ) : (
            <EmptyState icon="note" title={emptyTitle()} />
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
  error: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  loading: { paddingVertical: spacing.huge },
  earnings: { marginTop: spacing.xl, gap: spacing.xxs },
});
