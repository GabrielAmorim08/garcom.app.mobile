import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Badge, Button, Card } from '../../../shared/components';
import {
  formatCurrency,
  formatShortDate,
  formatTimeRange,
} from '../../../shared/utils/format';
import { colors, spacing } from '../../../theme';
import type { JobApplicationStatus, JobApplicationWithPost } from '../types';

type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';

const STATUS_TONE: Record<JobApplicationStatus, BadgeTone> = {
  Pending: 'gold',
  Accepted: 'success',
  Rejected: 'danger',
  Withdrawn: 'neutral',
  Cancelled: 'neutral',
};

interface ApplicationRowProps {
  application: JobApplicationWithPost;
  onPress: () => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
}

export function ApplicationRow({ application, onPress, onWithdraw, isWithdrawing }: ApplicationRowProps) {
  const { t } = useTranslation();
  const { jobPost } = application;

  const statusKey = `waiter.application.status.${application.status.toLowerCase()}`;

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
          {jobPost.title}
        </AppText>
        <Badge label={t(statusKey as never)} tone={STATUS_TONE[application.status]} />
      </View>

      <AppText variant="caption" color={colors.textMuted}>
        {`${formatShortDate(jobPost.shiftStart)} · ${formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)}`}
      </AppText>

      <AppText variant="bodyStrong" color={colors.primaryPressed}>
        {formatCurrency(jobPost.payAmount)}
      </AppText>

      {application.status === 'Pending' ? (
        <Button
          label={t('waiter.application.withdraw')}
          variant="ghost"
          size="md"
          loading={isWithdrawing}
          onPress={onWithdraw}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { flex: 1 },
});
