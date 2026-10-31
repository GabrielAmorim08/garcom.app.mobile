import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AssignmentRow } from '../../entities/jobAssignment/components/AssignmentRow';
import { useAssignmentHistory, useEarningsTimeline, useMonthEarnings } from '../../entities/jobAssignment/useJobAssignments';
import { AppText, Card, EmptyState, Icon, Screen, ScreenHeader } from '../../shared/components';
import { toMonthKey } from '../../shared/utils/date';
import { formatCurrency } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

function moveMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1 + amount, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthShort(month: string, locale: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short' })
    .format(new Date(year, monthNumber - 1, 1))
    .replace('.', '')
    .toUpperCase();
}

function monthLong(month: string, locale: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const value = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' })
    .format(new Date(year, monthNumber - 1, 1));
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EarningsDashboardScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const currentMonth = toMonthKey();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const months = useMemo(
    () => Array.from({ length: 6 }, (_, index) => moveMonth(selectedMonth, index - 5)),
    [selectedMonth],
  );
  const timeline = useEarningsTimeline(months);
  const { data: selectedEarnings } = useMonthEarnings(selectedMonth);
  const history = useAssignmentHistory();
  const services = (history.data?.items ?? [])
    .filter(item => item.status !== 'Cancelled'
      && item.jobPost.status !== 'Cancelled'
      && item.jobPost.shiftEnd.startsWith(selectedMonth))
    .slice(0, 5);
  const peak = Math.max(...timeline.map(item => item.data?.totalAmount ?? 0), 1);

  return (
    <Screen scrollable>
      <ScreenHeader title={t('waiter.earnings.title')} onBack={navigation.goBack} />
      <View style={styles.content}>
        <Card style={styles.summary}>
          <View style={styles.summaryTop}>
            <View>
              <AppText variant="caption" color={colors.textMuted}>
                {t('waiter.earnings.selectedMonth')}
              </AppText>
              <AppText variant="price" color={colors.primaryPressed}>
                {formatCurrency(selectedEarnings?.totalAmount ?? 0, selectedEarnings?.currency)}
              </AppText>
            </View>
            <View style={styles.monthNavigation}>
              <Pressable onPress={() => setSelectedMonth(month => moveMonth(month, -1))} style={styles.circleButton}>
                <Icon name="chevronLeft" size={20} />
              </Pressable>
              <Pressable
                disabled={selectedMonth >= currentMonth}
                onPress={() => setSelectedMonth(month => moveMonth(month, 1))}
                style={[styles.circleButton, selectedMonth >= currentMonth && styles.disabled]}>
                <Icon name="chevronRight" size={20} />
              </Pressable>
            </View>
          </View>
          <AppText variant="bodyStrong">{monthLong(selectedMonth, i18n.language)}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {t('waiter.earnings.servicesCount', { count: selectedEarnings?.assignmentsCount ?? 0 })}
          </AppText>
        </Card>

        <View>
          <AppText variant="subtitle">{t('waiter.earnings.chartTitle')}</AppText>
          <Card style={styles.chartCard}>
            <View style={styles.chart}>
              {timeline.map(item => {
                const amount = item.data?.totalAmount ?? 0;
                const selected = item.month === selectedMonth;
                return (
                  <Pressable
                    key={item.month}
                    onPress={() => setSelectedMonth(item.month)}
                    style={styles.barColumn}>
                    <View style={styles.barArea}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(8, (amount / peak) * 132) },
                          selected ? styles.barSelected : styles.barDefault,
                        ]}
                      />
                    </View>
                    <AppText
                      variant="overline"
                      color={selected ? colors.primaryPressed : colors.textMuted}
                      align="center">
                      {monthShort(item.month, i18n.language)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        </View>

        <View style={styles.servicesHeader}>
          <AppText variant="subtitle">{t('waiter.earnings.servicesTitle')}</AppText>
          <AppText variant="captionStrong" color={colors.primaryPressed} onPress={() => navigation.navigate('MyServices', { tab: 'history' })}>
            {t('waiter.earnings.seeMore')}
          </AppText>
        </View>

        {services.length > 0 ? (
          <View style={styles.services}>
            {services.map(assignment => (
              <AssignmentRow
                key={assignment.id}
                assignment={assignment}
                onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: assignment.id })}
              />
            ))}
          </View>
        ) : (
          <EmptyState icon="calendar" title={t('waiter.earnings.emptyServices')} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  summary: { gap: spacing.xs },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthNavigation: { flexDirection: 'row', gap: spacing.xs },
  circleButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.35 },
  chartCard: { marginTop: spacing.md, paddingVertical: spacing.lg },
  chart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.xs },
  barColumn: { flex: 1, alignItems: 'center', gap: spacing.sm },
  barArea: { height: 132, justifyContent: 'flex-end' },
  bar: { width: 20, borderRadius: 10 },
  barDefault: { backgroundColor: colors.border },
  barSelected: { backgroundColor: colors.primary, shadowColor: colors.primaryPressed, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4 },
  servicesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  services: { gap: spacing.sm },
});
