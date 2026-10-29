import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { JobPost, JobPostStatus, ProviderKind } from '../../entities/jobPost/types';
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
import {
  formatCurrency,
  formatShortDate,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';

type ServiceFilter = 'all' | 'open' | 'filled' | 'closed';

export function CompanyServicesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const [filter, setFilter] = useState<ServiceFilter>('all');

  const { data, isLoading, refetch, isRefetching } = useMyJobPosts();
  const items = data?.items ?? [];

  const summary = useMemo(() => buildSummary(items), [items]);
  const filteredItems = useMemo(
    () => items.filter(item => matchesFilter(item, filter)),
    [filter, items],
  );

  const filterOptions: SegmentOption<ServiceFilter>[] = [
    { value: 'all', label: t('company.services.filters.all') },
    { value: 'open', label: t('company.services.filters.open') },
    { value: 'filled', label: t('company.services.filters.filled') },
    { value: 'closed', label: t('company.services.filters.closed') },
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
            <Card style={styles.summaryCard}>
              <View style={styles.summaryTitleRow}>
                <View style={styles.summaryIcon}>
                  <Icon name="users" size={22} color={colors.primary} />
                </View>
                <View style={styles.summaryTitle}>
                  <AppText variant="subtitle" color={colors.textOnDark}>
                    {t('company.services.summaryTitle')}
                  </AppText>
                  <AppText variant="caption" color={colors.onHeroMuted}>
                    {t('company.services.summarySubtitle', { count: summary.total })}
                  </AppText>
                </View>
              </View>

              <View style={styles.summaryGrid}>
                <SummaryItem
                  value={String(summary.open)}
                  label={t('company.services.openServices')}
                />
                <SummaryItem
                  value={String(summary.filled)}
                  label={t('company.services.filledServices')}
                />
                <SummaryItem
                  value={String(summary.openSlots)}
                  label={t('company.services.openSlots')}
                />
              </View>
            </Card>

            <Button
              label={t('company.home.requestWaiter')}
              icon={<Icon name="plus" size={18} color={colors.onPrimary} />}
              onPress={() => navigation.navigate('NewRequestStepOne')}
            />

            <SegmentedControl options={filterOptions} value={filter} onChange={setFilter} />
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
  const isClosed = ['Cancelled', 'Completed'].includes(jobPost.status);
  const addressLine = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ');
  const providerLabel = t(providerKindKey(jobPost.providerKind));
  const statusLabel = t(statusKey(jobPost.status));

  return (
    <Card onPress={onPress} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceTitle}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {jobPost.title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {providerLabel}
          </AppText>
        </View>
        <Badge
          tone={isClosed ? 'neutral' : isFilled ? 'success' : 'gold'}
          label={
            isClosed
              ? statusLabel
              : isFilled
                ? t('company.services.filledBadge')
                : t('company.services.openBadge', { count: openSlots })
          }
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPercent * 100}%` }]} />
        </View>
        <View style={styles.progressTextRow}>
          <AppText variant="captionStrong" color={colors.textPrimary}>
            {t('company.services.fillProgress', {
              filled: jobPost.slotsFilled,
              total: jobPost.slots,
            })}
          </AppText>
          <AppText variant="caption" color={openSlots > 0 ? colors.primaryPressed : colors.success}>
            {openSlots > 0
              ? t('company.services.remainingSlots', { count: openSlots })
              : t('company.services.noRemainingSlots')}
          </AppText>
        </View>
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
        <MetaItem icon="users" text={t('company.services.providerCount', { count: jobPost.slots })} />
        <MetaItem icon="note" text={formatCurrency(jobPost.payAmount)} strong />
      </View>

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
      <AppText variant="title" color={colors.primary}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.onHeroMuted}>
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
      const isClosed = ['Cancelled', 'Completed'].includes(item.status);
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

function matchesFilter(item: JobPost, filter: ServiceFilter) {
  const openSlots = Math.max(item.slots - item.slotsFilled, 0);
  const isClosed = ['Cancelled', 'Completed'].includes(item.status);
  const isFilled = !isClosed && (openSlots === 0 || item.status === 'Filled');

  if (filter === 'open') {
    return !isClosed && !isFilled;
  }

  if (filter === 'filled') {
    return isFilled;
  }

  if (filter === 'closed') {
    return isClosed;
  }

  return true;
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

function providerKindKey(kind: ProviderKind) {
  const keys = {
    Waiter: 'serviceRequest.step1.providers.waiter.label',
    KitchenAssistant: 'serviceRequest.step1.providers.kitchenAssistant.label',
    PantryAttendant: 'serviceRequest.step1.providers.pantryAttendant.label',
    Bartender: 'serviceRequest.step1.providers.bartender.label',
    Receptionist: 'serviceRequest.step1.providers.receptionist.label',
    Cleaner: 'serviceRequest.step1.providers.cleaner.label',
    Other: 'serviceRequest.step1.providers.other.label',
  } as const satisfies Record<ProviderKind, string>;

  return keys[kind];
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
  summaryCard: {
    backgroundColor: colors.heroBackground,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.lg,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(176, 141, 87, 0.16)',
  },
  summaryTitle: { flex: 1, gap: 2 },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    gap: 2,
  },
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
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaItem: {
    width: '48%',
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
