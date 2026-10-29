import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';
import type { JobPost } from '../../entities/jobPost/types';
import { AppText, Badge, Button, Card, Icon, Screen } from '../../shared/components';
import { useTabBarClearance } from '../../shared/hooks/useTabBarClearance';
import { HeroBackdrop } from '../../shared/components/HeroBackdrop';
import { AppHeader } from '../../navigation/AppHeader';
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
  const tabBarClearance = useTabBarClearance();
  const { data, isLoading } = useMyJobPosts();
  const services = data?.items ?? [];

  if (services.length > 0) {
    const dashboard = buildDashboard(services);
    const nextService = dashboard.nextService;

    return (
      <Screen scrollable background={colors.background} contentStyle={styles.dashboardScroll}>
        <View style={styles.dashboardHero}>
          <View style={styles.dashboardHeader}>
            <AppHeader />
          </View>

          <View style={styles.heroMain}>
            <View style={styles.dashboardIntro}>
              <AppText variant="title" color={colors.textOnDark}>
                {t('company.dashboard.title')}
              </AppText>
              <AppText variant="body" color={colors.onHeroMuted}>
                {t('company.dashboard.subtitle')}
              </AppText>
            </View>

            <Button
              label={t('company.home.requestWaiter')}
              icon={<Icon name="plus" size={18} color={colors.onPrimary} />}
              style={styles.dashboardCta}
              onPress={() => navigation.navigate('NewRequestStepOne')}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <MetricCard
            value={String(dashboard.activeCount)}
            label={t('company.dashboard.activeServices')}
            tone="dark"
          />
          <MetricCard
            value={`${dashboard.slotsFilled}/${dashboard.totalSlots}`}
            label={t('company.dashboard.confirmedProviders')}
            tone="light"
          />
          <MetricCard
            value={String(dashboard.openSlots)}
            label={t('company.dashboard.openSlots')}
            tone="light"
          />
          <MetricCard
            value={formatCurrency(dashboard.expectedTotal)}
            label={t('company.dashboard.expectedTotal')}
            tone="gold"
          />
        </View>

        {nextService ? (
          <View style={styles.nextSection}>
            <AppText variant="subtitle">{t('company.dashboard.nextService')}</AppText>
            <Card
              style={styles.nextCard}
              onPress={() =>
                navigation.navigate('CompanyServiceDetail', { jobPostId: nextService.id })
              }>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitle}>
                  <AppText variant="subtitle" color={colors.textOnDark}>
                    {nextService.title}
                  </AppText>
                  <AppText variant="caption" color={colors.onHeroMuted}>
                    {`${formatShortDate(nextService.shiftStart)} · ${formatTimeRange(
                      nextService.shiftStart,
                      nextService.shiftEnd,
                    )}`}
                  </AppText>
                </View>
                <Badge tone="gold" label={nextService.status} />
              </View>

              <View style={styles.nextDivider} />

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
          </View>
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
                <AppText variant="bodyStrong" color={colors.textPrimary}>
                  {service.title}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {`${formatShortDate(service.shiftStart)} · ${formatCurrency(service.payAmount)}`}
                </AppText>
              </View>
              <Icon name="chevronRight" size={20} color={colors.primaryPressed} />
            </Card>
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen background={colors.heroBackground} edges={['top']} bleedUnderTabBar>
      <HeroBackdrop>
        <View style={[styles.content, { paddingBottom: spacing.xxl + tabBarClearance }]}>
          <View style={styles.brandRow}>
            <AppHeader />
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
              icon={<Icon name="plus" size={18} color={colors.onPrimary} />}
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
      <Icon name={icon} size={18} color={colors.primary} />
      <AppText variant="body" color={colors.onHeroMuted} style={styles.infoText}>
        {text}
      </AppText>
    </View>
  );
}

interface MetricCardProps {
  value: string;
  label: string;
  wide?: boolean;
  tone?: 'dark' | 'light' | 'gold';
}

function MetricCard({ value, label, wide = false, tone = 'light' }: MetricCardProps) {
  const isDark = tone === 'dark';
  const isGold = tone === 'gold';

  return (
    <View
      style={[
        styles.metricCard,
        isDark ? styles.metricCardDark : null,
        isGold ? styles.metricCardGold : null,
        wide ? styles.metricCardWide : null,
      ]}>
      <AppText
        variant="title"
        color={isDark ? colors.primary : isGold ? colors.heroBackground : colors.primaryPressed}>
        {value}
      </AppText>
      <AppText
        variant="caption"
        color={isDark ? colors.onHeroMuted : isGold ? colors.heroBackground : colors.textMuted}>
        {label}
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
  brandRow: { alignSelf: 'stretch' },
  heroCopy: { gap: spacing.md, marginBottom: spacing.xxl },
  actions: { gap: spacing.md },
  dashboardScroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  dashboardHeader: {
    alignSelf: 'stretch',
  },
  dashboardHero: {
    backgroundColor: colors.heroBackground,
    borderRadius: 8,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: spacing.xl,
  },
  heroMain: { gap: spacing.lg },
  dashboardIntro: { gap: spacing.xs },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  dashboardCta: {
    alignSelf: 'stretch',
  },
  metricCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: 112,
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  metricCardDark: {
    backgroundColor: colors.heroBackground,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricCardGold: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  metricCardWide: { width: '100%' },
  nextSection: { gap: spacing.md },
  nextCard: {
    gap: spacing.lg,
    backgroundColor: colors.heroBackground,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.12)' },
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  recentText: { flex: 1, gap: spacing.xs },
});
