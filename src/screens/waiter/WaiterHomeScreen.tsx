import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useMyApplications } from '../../entities/jobApplication/useWaiterApplications';
import type { JobApplicationStatus } from '../../entities/jobApplication/types';
import { useUpcomingAssignments } from '../../entities/jobAssignment/useJobAssignments';
import { useCurrentUser, useWaiterProfile } from '../../entities/user/useUser';
import { AppText, Badge, Card, EmptyState, Icon } from '../../shared/components';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { daysFromToday } from '../../shared/utils/date';
import { firstName, formatShortDate, formatTimeRange, formatRating } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import { TabScreen } from '../../navigation/TabScreen';

type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';

const APPLICATION_TONE: Record<JobApplicationStatus, BadgeTone> = {
  Pending: 'gold',
  Accepted: 'success',
  Rejected: 'danger',
  Withdrawn: 'neutral',
  Cancelled: 'neutral',
  Invited: 'gold',
  Declined: 'neutral',
};

export function WaiterHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const tabBarClearance = useTabBarClearance();
  const { data: user } = useCurrentUser();
  const { data: profile } = useWaiterProfile();
  const upcoming = useUpcomingAssignments();
  const applications = useMyApplications();

  const nextAssignment = upcoming.data?.items[0];
  const recentApplications = (applications.data?.items ?? []).slice(0, 3);

  return (
    <TabScreen
      title={t('waiter.home.greeting', { name: firstName(user?.fullName ?? '') })}
      subtitle={t('waiter.home.subtitle')}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + tabBarClearance }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">{t('waiter.home.nextService')}</AppText>
          {nextAssignment ? (
            <AppText
              variant="captionStrong"
              color={colors.primaryPressed}
              onPress={() => navigation.navigate('MyServices', { tab: 'upcoming' })}>
              {t('waiter.home.viewAll')}
            </AppText>
          ) : null}
        </View>

        {nextAssignment ? (
          <Card
            flush
            onPress={() =>
              navigation.navigate('AssignmentDetail', { assignmentId: nextAssignment.id })
            }>
            <View style={styles.nextHero}>
              <View style={styles.dateBlock}>
                <AppText variant="overline" color={colors.onHeroMuted} align="center">
                  {daysFromToday(nextAssignment.jobPost.shiftStart) === 0
                    ? t('common.today').toUpperCase()
                    : formatShortDate(nextAssignment.jobPost.shiftStart).toUpperCase()}
                </AppText>
                <AppText variant="title" color={colors.textOnDark} align="center">
                  {String(new Date(nextAssignment.jobPost.shiftStart).getDate()).padStart(2, '0')}
                </AppText>
              </View>

              <View style={styles.nextDetails}>
                <AppText variant="overline" color={colors.onHeroMuted}>
                  {t('waiter.home.nextConfirmed')}
                </AppText>
                <AppText variant="subtitle" color={colors.textOnDark} numberOfLines={1}>
                  {nextAssignment.jobPost.title}
                </AppText>
                <AppText variant="caption" color={colors.onHeroMuted} numberOfLines={1}>
                  {nextAssignment.jobPost.companyName}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={colors.onHeroMuted} />
            </View>

            <View style={styles.nextMeta}>
              <Icon name="clock" size={16} color={colors.primaryPressed} />
              <AppText variant="captionStrong">
                {formatTimeRange(nextAssignment.jobPost.shiftStart, nextAssignment.jobPost.shiftEnd)}
              </AppText>
              <View style={styles.metaDivider} />
              <Icon name="pin" size={16} color={colors.primaryPressed} />
              <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.metaAddress}>
                {[nextAssignment.jobPost.address.street, nextAssignment.jobPost.address.number]
                  .filter(Boolean)
                  .join(', ')}
              </AppText>
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyNext}>
            <EmptyState
              icon="calendar"
              title={t('waiter.home.noUpcomingTitle')}
              message={t('waiter.home.noUpcomingHint')}
            />
          </Card>
        )}

        <View style={styles.stats}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('waiter.home.earningsShortcut')}
            onPress={() => navigation.navigate('EarningsDashboard')}
            style={styles.servicesDashboardButton}>
            <Card style={styles.servicesDashboardCard}>
              <View style={styles.chartShortcut}>
                <Icon name="chart" size={20} color={colors.primaryPressed} />
                <AppText variant="overline" color={colors.primaryPressed}>
                  {t('waiter.home.earningsShortcut')}
                </AppText>
              </View>
              <View style={styles.servicesDashboardText}>
                <AppText variant="title" color={colors.primaryPressed}>
                  {String(profile?.completedServices ?? 0)}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {t('waiter.home.servicesDone')}
                </AppText>
              </View>
              <Icon name="chevronRight" size={16} color={colors.textMuted} />
            </Card>
          </Pressable>
          <Card style={styles.ratingCard}>
            <View style={styles.ratingValue}>
              <AppText variant="title" color={colors.primaryPressed}>
                {formatRating(profile?.averageRating ?? 0)}
              </AppText>
              <Icon name="star" size={15} color={colors.primary} filled />
            </View>
            <AppText variant="caption" color={colors.textMuted}>
              {t('waiter.home.averageRating')}
            </AppText>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">{t('waiter.home.applicationsTitle')}</AppText>
          {recentApplications.length > 0 ? (
            <AppText
              variant="captionStrong"
              color={colors.primaryPressed}
              onPress={() => navigation.navigate('MyServices', { tab: 'applications' })}>
              {t('waiter.home.viewAll')}
            </AppText>
          ) : null}
        </View>

        {recentApplications.length > 0 ? (
          <View style={styles.applications}>
            {recentApplications.map(application => (
              <Card
                key={application.id}
                onPress={() =>
                  navigation.navigate('ServiceDetail', { jobPostId: application.jobPostId })
                }
                style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <AppText variant="bodyStrong" numberOfLines={1} style={styles.applicationTitle}>
                    {application.jobPost.title}
                  </AppText>
                  <Badge
                    label={t(`waiter.application.status.${application.status.toLowerCase()}` as never)}
                    tone={APPLICATION_TONE[application.status]}
                  />
                </View>
                <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {application.jobPost.companyName}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {`${formatShortDate(application.jobPost.shiftStart)} · ${formatTimeRange(
                    application.jobPost.shiftStart,
                    application.jobPost.shiftEnd,
                  )}`}
                </AppText>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyApplications}>
            <EmptyState
              icon="note"
              title={t('waiter.home.noApplicationsTitle')}
              message={t('waiter.home.noApplicationsHint')}
            />
          </Card>
        )}

      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.heroBackground,
    padding: spacing.lg,
  },
  dateBlock: {
    width: 56,
    minHeight: 56,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.onHeroMuted,
    paddingRight: spacing.md,
  },
  nextDetails: { flex: 1, gap: 2 },
  nextMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.md },
  metaDivider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: spacing.xs },
  metaAddress: { flex: 1 },
  emptyNext: { paddingVertical: spacing.sm },
  applications: { gap: spacing.sm },
  applicationCard: { gap: spacing.xxs },
  applicationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  applicationTitle: { flex: 1 },
  emptyApplications: { paddingVertical: spacing.sm },
  stats: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  servicesDashboardButton: { width: '48%' },
  servicesDashboardCard: {
    width: '100%',
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  servicesDashboardText: { flex: 1, gap: spacing.xxs },
  chartShortcut: { alignItems: 'center', gap: spacing.xxs },
  ratingCard: {
    width: '48%',
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
  },
  ratingValue: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
