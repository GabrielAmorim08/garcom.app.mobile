import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { JobPost, JobPostStatus } from '../../entities/jobPost/types';
import {
  AppText,
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  SegmentedControl,
  type SegmentOption,
} from '../../shared/components';
import { TabScreen } from '../../navigation/TabScreen';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { toMonthKey } from '../../shared/utils/date';
import {
  formatCurrency,
  formatShortDate,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';

type ServiceFilter = 'upcoming' | 'previous' | 'cancelled';

function moveMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function historyMonthLabel(month: string, locale: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(new Date(year, monthNumber - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function CompanyServicesScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const [filter, setFilter] = useState<ServiceFilter>('upcoming');
  const [historyMonth, setHistoryMonth] = useState(toMonthKey);

  const { data, isLoading, refetch, isRefetching } = useMyJobPosts();
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const summary = useMemo(() => buildSummary(items), [items]);
  const filteredItems = useMemo(
    () => items.filter(item => matchesFilter(item, filter, historyMonth)),
    [filter, historyMonth, items],
  );

  const filterOptions: SegmentOption<ServiceFilter>[] = [
    { value: 'upcoming', label: t('company.services.filters.upcoming') },
    { value: 'previous', label: t('company.services.filters.previous') },
    { value: 'cancelled', label: t('company.services.filters.cancelled') },
  ];

  return (
    <TabScreen title={t('company.home.myServices')}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: spacing.xxl + tabBarClearance }]}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.summaryGrid}>
                <SummaryItem
                  value={String(summary.open)}
                  label={t('company.services.openServices')}
                />
                <View style={styles.summaryDivider} />
                <SummaryItem
                  value={String(summary.filled)}
                  label={t('company.services.filledServices')}
                />
                <View style={styles.summaryDivider} />
                <SummaryItem
                  value={String(summary.openSlots)}
                  label={t('company.services.openSlots')}
                />
            </View>

            <Button
              label={t('company.home.requestWaiter')}
              icon={<Icon name="plus" size={18} color={colors.onPrimary} />}
              size="md"
              onPress={() => navigation.navigate('NewRequestStepOne')}
            />

            <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />

            {filter === 'previous' ? (
              <View style={styles.historyMonthPicker}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('company.services.previousMonth')}
                  onPress={() => setHistoryMonth(month => moveMonth(month, -1))}
                  style={styles.historyMonthButton}>
                  <Icon name="chevronLeft" size={18} color={colors.textPrimary} />
                </Pressable>
                <AppText variant="bodyStrong">{historyMonthLabel(historyMonth, i18n.language)}</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('company.services.nextMonth')}
                  disabled={historyMonth >= toMonthKey()}
                  onPress={() => setHistoryMonth(month => moveMonth(month, 1))}
                  style={[
                    styles.historyMonthButton,
                    historyMonth >= toMonthKey() && styles.historyMonthButtonDisabled,
                  ]}>
                  <Icon name="chevronRight" size={18} color={colors.textPrimary} />
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <CompanyServiceCard
            jobPost={item}
            onPress={() => navigation.navigate('CompanyServiceDetail', { jobPostId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {isLoading ? (
              <AppText variant="caption" align="center" style={styles.loading}>
                {t('common.loading')}
              </AppText>
            ) : (
              <EmptyState
                icon="note"
                title={
                  items.length === 0
                    ? t('company.services.emptyTitle')
                    : t('company.services.emptyFilteredTitle')
                }
                message={
                  items.length === 0
                    ? t('company.services.emptyHint')
                    : t('company.services.emptyFilteredHint')
                }
              />
            )}
          </View>
        }
      />
    </TabScreen>
  );
}

interface CompanyServiceCardProps {
  jobPost: JobPost;
  onPress: () => void;
}

function CompanyServiceCard({ jobPost, onPress }: CompanyServiceCardProps) {
  const { t } = useTranslation();
  const openSlots = Math.max(jobPost.slots - jobPost.slotsFilled, 0);
  const fillPercent = jobPost.slots > 0 ? Math.min(jobPost.slotsFilled / jobPost.slots, 1) : 0;
  const isFilled = openSlots === 0 || jobPost.status === 'Filled';
  const isExpired = new Date(jobPost.shiftEnd).getTime() <= Date.now();
  const isClosed = isExpired || ['Cancelled', 'Completed'].includes(jobPost.status);
  const addressLine = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ');
  const isStarted = Boolean(jobPost.startedAt);
  const statusLabel = isStarted
    ? t('company.serviceDetail.inProgress')
    : isExpired
      ? 'Expirada'
      : t(statusKey(jobPost.status));

  return (
    <Card onPress={onPress} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceTitle}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {jobPost.title}
          </AppText>
        </View>
        <Badge
          tone={isStarted || isFilled ? 'success' : isClosed ? 'neutral' : 'gold'}
          label={
            isStarted
              ? statusLabel
              : isExpired
              ? 'Expirada'
              : isClosed
              ? statusLabel
              : isFilled
                ? t('company.services.filledBadge')
                : t('company.services.openBadge', { count: openSlots })
          }
        />
      </View>

      <View style={styles.metaGrid}>
        <MetaItem
          icon="calendar"
          text={`${formatShortDate(jobPost.shiftStart)} · ${formatTimeRange(
            jobPost.shiftStart,
            jobPost.shiftEnd,
          )}`}
        />
        <MetaItem icon="pin" text={addressLine || jobPost.address.city || '-'} />
        <MetaItem icon="note" text={`${formatCurrency(jobPost.payAmount)} / profissional`} strong />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTextRow}>
          <AppText variant="bodyStrong" color={colors.textPrimary}>
            {t('company.services.fillProgress', { filled: jobPost.slotsFilled, total: jobPost.slots })}
          </AppText>
          {openSlots > 0 ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('company.services.remainingSlots', { count: openSlots })}
            </AppText>
          ) : null}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPercent * 100}%` }]} />
        </View>
      </View>

      {jobPost.pendingApplicationsCount > 0 ? (
        <View style={styles.applicantsNotice}>
          <Icon name="users" size={18} color={colors.primaryPressed} />
          <AppText variant="captionStrong" color={colors.primaryPressed} style={styles.applicantsText}>
            {t('company.services.pendingApplicants', { count: jobPost.pendingApplicationsCount })}
          </AppText>
          <AppText variant="captionStrong" color={colors.primaryPressed}>Ver candidatos</AppText>
          <Icon name="chevronRight" size={18} color={colors.primaryPressed} />
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <AppText variant="caption" color={colors.textMuted}>
          {statusLabel}
        </AppText>
        <Icon name="chevronRight" size={20} color={colors.primaryPressed} />
      </View>
    </Card>
  );
}

interface SummaryItemProps {
  value: string;
  label: string;
}

function SummaryItem({ value, label }: SummaryItemProps) {
  return (
    <View style={styles.summaryItem}>
      <AppText variant="title" color={colors.primaryPressed}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

interface MetaItemProps {
  icon: 'calendar' | 'pin' | 'users' | 'note';
  text: string;
  strong?: boolean;
}

function MetaItem({ icon, text, strong = false }: MetaItemProps) {
  return (
    <View style={styles.metaItem}>
      <Icon name={icon} size={16} color={colors.primaryPressed} />
      <AppText
        variant={strong ? 'captionStrong' : 'caption'}
        color={strong ? colors.primaryPressed : colors.textSecondary}
        numberOfLines={1}
        style={styles.metaText}>
        {text}
      </AppText>
    </View>
  );
}

function buildSummary(items: JobPost[]) {
  return items.reduce(
    (summary, item) => {
      const openSlots = Math.max(item.slots - item.slotsFilled, 0);
      const isClosed = new Date(item.shiftEnd).getTime() <= Date.now()
        || ['Cancelled', 'Completed'].includes(item.status);
      const isFilled = !isClosed && (openSlots === 0 || item.status === 'Filled');

      return {
        total: summary.total + 1,
        open: summary.open + (!isClosed && !isFilled ? 1 : 0),
        filled: summary.filled + (isFilled ? 1 : 0),
        openSlots: summary.openSlots + (!isClosed ? openSlots : 0),
      };
    },
    { total: 0, open: 0, filled: 0, openSlots: 0 },
  );
}

function matchesFilter(item: JobPost, filter: ServiceFilter, historyMonth: string) {
  if (filter === 'cancelled') return item.status === 'Cancelled';

  const isPast = new Date(item.shiftEnd).getTime() <= Date.now();
  if (filter === 'previous') {
    return isPast && item.status !== 'Cancelled' && item.shiftEnd.startsWith(historyMonth);
  }

  return !isPast && item.status !== 'Cancelled';
}

function statusKey(status: JobPostStatus) {
  const keys = {
    Draft: 'serviceRequest.status.draft',
    Published: 'serviceRequest.status.published',
    Filled: 'serviceRequest.status.filled',
    Cancelled: 'serviceRequest.status.cancelled',
    Completed: 'serviceRequest.status.completed',
  } as const satisfies Record<JobPostStatus, string>;

  return keys[status];
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  summaryItem: {
    flex: 1,
    gap: 2,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  summaryDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  historyMonthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
  },
  historyMonthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  historyMonthButtonDisabled: { opacity: 0.35 },
  serviceCard: {
    gap: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  serviceTitle: {
    flex: 1,
    gap: 2,
  },
  progressBlock: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  applicantsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  applicantsText: { flex: 1 },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 24,
  },
  metaText: { flex: 1 },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyWrap: {
    paddingTop: spacing.xl,
  },
  loading: { paddingVertical: spacing.huge },
});
