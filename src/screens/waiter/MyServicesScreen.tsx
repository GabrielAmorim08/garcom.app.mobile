import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ApplicationRow } from '../../entities/jobApplication/components/ApplicationRow';
import {
  useApplicationHistory,
  useMyApplications,
  useAnswerInvitation,
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
  Icon,
  ListSeparator,
  Screen,
  ScreenHeader,
  SegmentedControl,
} from '../../shared/components';
import { toMonthKey } from '../../shared/utils/date';
import { formatCurrency } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type Tab = 'upcoming' | 'applications' | 'history';
type HistoryItem =
  | { kind: 'assignment'; value: JobAssignmentWithPost }
  | { kind: 'application'; value: JobApplicationWithPost };

function moveMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string, locale: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(new Date(year, monthNumber - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MyServicesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'MyServices'>>();

  const [tab, setTab] = useState<Tab>(params?.tab ?? 'upcoming');
  const [reportMonth, setReportMonth] = useState(toMonthKey);
  const [error, setError] = useState<string | null>(null);

  const upcoming = useUpcomingAssignments();
  const history = useAssignmentHistory();
  const applications = useMyApplications();
  const applicationHistory = useApplicationHistory();
  const { data: earnings } = useMonthEarnings(reportMonth);
  const { mutateAsync: withdraw, isPending: isWithdrawing, variables } = useWithdrawApplication();
  const { mutateAsync: answerInvitation, isPending: isAnswering, variables: answering } = useAnswerInvitation();

  const historyItems = useMemo<HistoryItem[]>(() => {
    const assignments = (history.data?.items ?? []).map(value => ({ kind: 'assignment' as const, value }));
    const applicationsFromPast = (applicationHistory.data?.items ?? [])
      .filter(application => application.status !== 'Accepted')
      .map(value => ({ kind: 'application' as const, value }));

    return [...assignments, ...applicationsFromPast].sort(
      (first, second) =>
        new Date(second.value.jobPost.shiftEnd).getTime()
        - new Date(first.value.jobPost.shiftEnd).getTime(),
    );
  }, [applicationHistory.data?.items, history.data?.items]);

  const active = tab === 'upcoming' ? upcoming : applications;
  const listData: Array<JobAssignmentWithPost | JobApplicationWithPost | HistoryItem> =
    tab === 'history' ? historyItems : active.data?.items ?? [];
  const isLoading = tab === 'history'
    ? history.isLoading || applicationHistory.isLoading
    : active.isLoading;
  const isRefreshing = tab === 'history'
    ? history.isRefetching || applicationHistory.isRefetching
    : active.isRefetching;
  const currentMonth = toMonthKey();

  async function withdrawApplication(application: JobApplicationWithPost) {
    setError(null);

    try {
      await withdraw({ applicationId: application.id, jobPostId: application.jobPostId });
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }

  async function answer(application: JobApplicationWithPost, accept: boolean) {
    setError(null);

    try {
      await answerInvitation({ applicationId: application.id, accept });
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

  function refresh() {
    if (tab === 'history') {
      void Promise.all([history.refetch(), applicationHistory.refetch()]);
      return;
    }

    void active.refetch();
  }

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
        data={listData}
        keyExtractor={item => {
          if (tab === 'history') {
            const historyItem = item as HistoryItem;
            return `${historyItem.kind}-${historyItem.value.id}`;
          }

          return (item as JobAssignmentWithPost | JobApplicationWithPost).id;
        }}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={isRefreshing}
        ItemSeparatorComponent={ListSeparator}
        renderItem={({ item }) => {
          if (tab === 'history') {
            const historyItem = item as HistoryItem;
            if (historyItem.kind === 'application') {
              return (
                <ApplicationRow
                  application={historyItem.value}
                  isWithdrawing={false}
                  allowWithdraw={false}
                  onPress={() => navigation.navigate('ServiceDetail', { jobPostId: historyItem.value.jobPostId })}
                  onWithdraw={() => undefined}
                />
              );
            }

            return (
              <AssignmentRow
                assignment={historyItem.value}
                onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: historyItem.value.id })}
              />
            );
          }

          if (tab === 'applications') {
            const application = item as JobApplicationWithPost;
            return (
              <ApplicationRow
                application={application}
                isWithdrawing={isWithdrawing && variables?.applicationId === application.id}
                onPress={() => navigation.navigate('ServiceDetail', { jobPostId: application.jobPostId })}
                onWithdraw={() => withdrawApplication(application)}
                onAccept={() => answer(application, true)}
                onDecline={() => answer(application, false)}
                isAnswering={isAnswering && answering?.applicationId === application.id}
              />
            );
          }

          const assignment = item as JobAssignmentWithPost;
          return (
            <AssignmentRow
              assignment={assignment}
              onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: assignment.id })}
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <AppText variant="caption" align="center" style={styles.loading}>
              {t('common.loading')}
            </AppText>
          ) : (
            <EmptyState icon="note" title={emptyTitle()} />
          )
        }
        ListHeaderComponent={
          tab !== 'history' ? undefined : (
            <Card style={styles.report}>
              <View style={styles.reportHeader}>
                <View>
                  <AppText variant="caption" color={colors.textMuted}>
                    {t('waiter.myServices.monthlyReport')}
                  </AppText>
                  <AppText variant="price" color={colors.primaryPressed}>
                    {formatCurrency(earnings?.totalAmount ?? 0, earnings?.currency)}
                  </AppText>
                </View>
                <View style={styles.monthControls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('waiter.myServices.previousMonth')}
                    onPress={() => setReportMonth(month => moveMonth(month, -1))}
                    style={styles.monthButton}>
                    <Icon name="chevronLeft" size={18} color={colors.textPrimary} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('waiter.myServices.nextMonth')}
                    disabled={reportMonth >= currentMonth}
                    onPress={() => setReportMonth(month => moveMonth(month, 1))}
                    style={[styles.monthButton, reportMonth >= currentMonth && styles.monthButtonDisabled]}>
                    <Icon name="chevronRight" size={18} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
              <AppText variant="bodyStrong">{monthLabel(reportMonth, i18n.language)}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {t('waiter.myServices.monthlyServices', { count: earnings?.assignmentsCount ?? 0 })}
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
  report: { gap: spacing.xs, marginBottom: spacing.xl },
  reportHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  monthControls: { flexDirection: 'row', gap: spacing.xs },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  monthButtonDisabled: { opacity: 0.35 },
});
