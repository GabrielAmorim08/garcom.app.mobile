import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useJobPost } from '../../entities/jobPost/useJobPosts';
import {
  AppText,
  Button,
  Card,
  Icon,
  Screen,
  SuccessSeal,
} from '../../shared/components';
import { formatCurrency, formatLongDate, formatTimeRange } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

/** Shown after the company accepts the waiter for a shift. */
export function ServiceConfirmedScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceConfirmed'>>();

  const { data: jobPost } = useJobPost(params.jobPostId);

  const addressLine = jobPost
    ? [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ')
    : '';
  const cityLine = jobPost
    ? [jobPost.address.district, jobPost.address.city, jobPost.address.state]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <Screen
      scrollable
      footer={
        <View style={styles.footer}>
          <Button
            label={t('common.seeDetails')}
            onPress={() => navigation.navigate('MyServices')}
          />
          <Button
            label={t('waiter.confirmed.chat')}
            variant="ghost"
            onPress={() => navigation.navigate('WaiterTabs', { screen: 'Messages' })}
          />
        </View>
      }>
      <View style={styles.content}>
        <SuccessSeal tone="success" />

        <View style={styles.headline}>
          <AppText variant="title" align="center">
            {t('waiter.confirmed.title')}
          </AppText>
          <AppText variant="subtitle" align="center">
            {t('waiter.confirmed.subtitle')}
          </AppText>
        </View>

        {jobPost ? (
          <Card style={styles.summary}>
            <View style={styles.row}>
              <Icon name="calendar" size={18} color={colors.textMuted} />
              <View style={styles.rowTexts}>
                <AppText variant="bodyStrong">{jobPost.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {`${formatLongDate(jobPost.shiftStart)} · ${formatTimeRange(
                    jobPost.shiftStart,
                    jobPost.shiftEnd,
                  )}`}
                </AppText>
              </View>
            </View>

            <View style={styles.row}>
              <Icon name="pin" size={18} color={colors.textMuted} />
              <View style={styles.rowTexts}>
                <AppText variant="body">{addressLine}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {cityLine}
                </AppText>
              </View>
            </View>

            <View style={styles.row}>
              <Icon name="star" size={18} color={colors.primary} filled />
              <AppText variant="bodyStrong" color={colors.primaryPressed}>
                {formatCurrency(jobPost.payAmount)}
              </AppText>
            </View>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.huge,
    gap: spacing.xl,
  },
  headline: { gap: spacing.xs },
  summary: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowTexts: { flex: 1, gap: 1 },
  footer: { gap: spacing.sm },
});
