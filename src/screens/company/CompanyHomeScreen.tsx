import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';
import type { JobPost } from '../../entities/jobPost/types';
import { AppText, Badge, Button, Card, Icon, Screen, StatCard } from '../../shared/components';
import { HeroBackdrop } from '../../shared/components/HeroBackdrop';
import { Wordmark } from '../../shared/components/Wordmark';
import {
  formatCurrency,
  formatShortDate,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

/**
 * Company landing screen: dark cover with the value proposition and the two
 * actions that start the flow.
 */
export function CompanyHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data, isLoading } = useMyJobPosts();
  const services = data?.items ?? [];

  if (services.length > 0) {
    const dashboard = buildDashboard(services);
    const nextService = dashboard.nextService;

    return (
      <Screen scrollable contentStyle={styles.dashboardScroll}>
        <View style={styles.dashboardHeader}>
          <Wordmark tone="light" size={22} />
          <Button
            label={t('company.home.requestWaiter')}
            size="md"
            onPress={() => navigation.navigate('NewRequestStepOne')}
          />
        </View>

        <View style={styles.dashboardIntro}>
          <AppText variant="title">{t('company.dashboard.title')}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {t('company.dashboard.subtitle')}
          </AppText>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              value={String(dashboard.activeCount)}
              label={t('company.dashboard.activeServices')}
            />
            <StatCard
              value={`${dashboard.slotsFilled}/${dashboard.totalSlots}`}
              label={t('company.dashboard.confirmedProviders')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              value={formatCurrency(dashboard.expectedTotal)}
              label={t('company.dashboard.expectedTotal')}
            />
            <StatCard
              value={String(dashboard.openSlots)}
              label={t('company.dashboard.openSlots')}
            />
          </View>
        </View>

        {nextService ? (
          <Card
            style={styles.nextCard}
            onPress={() =>
              navigation.navigate('CompanyServiceDetail', { jobPostId: nextService.id })
            }>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <AppText variant="captionStrong" color={colors.primaryPressed}>
                  {t('company.dashboard.nextService')}
                </AppText>
                <AppText variant="subtitle">{nextService.title}</AppText>
              </View>
              <Badge tone="gold" label={nextService.status} />
            </View>

            <InfoRow
              icon="calendar"
              text={`${formatShortDate(nextService.shiftStart)} · ${formatTimeRange(
                nextService.shiftStart,
                nextService.shiftEnd,
              )}`}
            />
            <InfoRow
              icon="pin"
              text={[nextService.address.street, nextService.address.number]
                .filter(Boolean)
                .join(', ')}
            />
            <InfoRow
              icon="users"
              text={t('company.dashboard.serviceSlots', {
                filled: nextService.slotsFilled,
                total: nextService.slots,
              })}
            />
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">{t('company.dashboard.recentServices')}</AppText>
          <Button
            label={t('common.seeDetails')}
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate('CompanyTabs', { screen: 'CompanyServices' })}
          />
        </View>

        <View style={styles.recentList}>
          {dashboard.recentServices.map(service => (
            <Card
              key={service.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('CompanyServiceDetail', { jobPostId: service.id })}>
              <View style={styles.recentText}>
                <AppText variant="bodyStrong">{service.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {`${formatShortDate(service.shiftStart)} · ${formatCurrency(service.payAmount)}`}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={colors.textMuted} />
            </Card>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen background={colors.heroBackground} edges={['top']}>
      <HeroBackdrop>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <Wordmark tone="dark" size={22} />
          </View>

          <View style={styles.heroCopy}>
            <AppText variant="display" color={colors.textOnDark}>
              {t('company.home.heroTitle')}
            </AppText>
            <AppText variant="body" color={colors.onHeroMuted}>
              {isLoading ? t('common.loading') : t('company.home.heroSubtitle')}
            </AppText>
          </View>

          <View style={styles.actions}>
            <Button
              label={t('company.home.requestWaiter')}
              onPress={() => navigation.navigate('NewRequestStepOne')}
            />
            <Button
              label={t('company.home.myServices')}
              variant="secondary"
              onPress={() => navigation.navigate('CompanyTabs', { screen: 'CompanyServices' })}
            />
          </View>
        </View>
      </HeroBackdrop>
    </Screen>
  );
}

function buildDashboard(services: JobPost[]) {
  const now = Date.now();
  const activeServices = services.filter(service =>
    ['Published', 'Filled'].includes(service.status),
  );
  const upcomingServices = activeServices
    .filter(service => new Date(service.shiftEnd).getTime() >= now)
    .sort((a, b) => new Date(a.shiftStart).getTime() - new Date(b.shiftStart).getTime());

  const totalSlots = activeServices.reduce((sum, service) => sum + service.slots, 0);
  const slotsFilled = activeServices.reduce((sum, service) => sum + service.slotsFilled, 0);
  const expectedTotal = activeServices.reduce(
    (sum, service) => sum + service.payAmount * service.slots,
    0,
  );

  return {
    activeCount: activeServices.length,
    slotsFilled,
    totalSlots,
    openSlots: Math.max(totalSlots - slotsFilled, 0),
    expectedTotal,
    nextService: upcomingServices[0] ?? activeServices[0],
    recentServices: [...services]
      .sort((a, b) => new Date(b.shiftStart).getTime() - new Date(a.shiftStart).getTime())
      .slice(0, 3),
  };
}

interface InfoRowProps {
  icon: 'calendar' | 'pin' | 'users';
  text: string;
}

function InfoRow({ icon, text }: InfoRowProps) {
  if (!text) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color={colors.textMuted} />
      <AppText variant="body" color={colors.textSecondary} style={styles.infoText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brandRow: { alignItems: 'center' },
  heroCopy: { gap: spacing.md, marginBottom: spacing.xxl },
  actions: { gap: spacing.md },
  dashboardScroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dashboardIntro: { gap: spacing.xs },
  statsGrid: { gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  nextCard: { gap: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: { flex: 1, gap: spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoText: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  recentList: { gap: spacing.md },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  recentText: { flex: 1, gap: spacing.xs },
});
