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
  Invited: 'gold',
  Declined: 'neutral',
};

interface ApplicationRowProps {
  application: JobApplicationWithPost;
  onPress: () => void;
  onWithdraw: () => void;
  isWithdrawing: boolean;
  allowWithdraw?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  isAnswering?: boolean;
}

export function ApplicationRow({
  application,
  onPress,
  onWithdraw,
  isWithdrawing,
  allowWithdraw = true,
  onAccept,
  onDecline,
  isAnswering = false,
}: ApplicationRowProps) {
  const { t } = useTranslation();
  const { jobPost } = application;
  const canAnswer = application.status === 'Invited' && new Date(jobPost.shiftStart).getTime() > Date.now();

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

      {application.status === 'Invited' ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {t(canAnswer ? 'waiter.invitation.hint' : 'waiter.invitation.expired', { company: jobPost.companyName })}
        </AppText>
      ) : null}

      {canAnswer && onAccept && onDecline ? (
        <View style={styles.answer}>
          <Button
            label={t('waiter.invitation.decline')}
            variant="secondary"
            size="md"
            disabled={isAnswering}
            onPress={onDecline}
          />
          <Button label={t('waiter.invitation.accept')} size="md" loading={isAnswering} onPress={onAccept} />
        </View>
      ) : null}

      {allowWithdraw && application.status === 'Pending' ? (
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
  answer: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.sm },
});
