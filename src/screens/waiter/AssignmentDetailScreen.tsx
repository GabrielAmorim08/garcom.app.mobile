import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import {
  useCheckIn,
  useCheckOut,
  useJobAssignment,
} from '../../entities/jobAssignment/useJobAssignments';
import type { JobAssignmentStatus } from '../../entities/jobAssignment/types';
import type { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../shared/api/errorMessage';
import {
  AppText,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Icon,
  MapPreview,
  NoticeDialog,
  Screen,
  ScreenHeader,
} from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import {
  formatCurrency,
  formatLongDate,
  formatTime,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';

const STATUS_TONE: Record<JobAssignmentStatus, BadgeTone> = {
  Confirmed: 'gold',
  CheckedIn: 'success',
  CheckedOut: 'neutral',
  Disputed: 'danger',
  Completed: 'success',
  NoShow: 'danger',
  Cancelled: 'danger',
};

function statusLabelKey(status: JobAssignmentStatus): string {
  return `assignment.status.${status.charAt(0).toLowerCase()}${status.slice(1)}`;
}

export function AssignmentDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'AssignmentDetail'>>();

  const { data: assignment, isLoading, error: assignmentError } = useJobAssignment(params.assignmentId);
  const { request: requestLocation, isLocating } = useCurrentLocation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<'checkIn' | 'checkOut' | null>(null);
  const [done, setDone] = useState<{ kind: 'checkIn' | 'checkOut'; time: string } | null>(null);

  async function registerPoint(kind: 'checkIn' | 'checkOut') {
    setConfirming(null);
    setError(null);

    const location = await requestLocation();
    if (!location) {
      setError(t('waiter.assignmentDetail.locationDenied'));
      return;
    }

    try {
      const action = kind === 'checkIn' ? checkIn : checkOut;
      await action.mutateAsync({ assignmentId: params.assignmentId, location });
      setDone({ kind, time: formatTime(new Date().toISOString()) });
    } catch (failure) {
      setError(getErrorMessage(failure, t));
    }
  }

  if (isLoading || !assignment) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <AppText variant="caption" align="center" style={styles.loading}>
          {assignmentError ? getErrorMessage(assignmentError, t) : t('common.loading')}
        </AppText>
      </Screen>
    );
  }

  const { jobPost } = assignment;
  const addressLine = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ');
  const cityLine = [jobPost.address.district, jobPost.address.city, jobPost.address.state]
    .filter(Boolean)
    .join(', ');

  const canCheckIn = assignment.status === 'Confirmed';
  const canCheckOut = assignment.status === 'CheckedIn';
  const isBusy = isLocating || checkIn.isPending || checkOut.isPending;

  return (
    <Screen
      scrollable
      footer={
        canCheckIn || canCheckOut ? (
          <View style={styles.footer}>
            {error ? (
              <AppText variant="caption" align="center" color={colors.danger}>
                {error}
              </AppText>
            ) : null}
            {canCheckIn ? (
              <>
                <Button
                  label={t('waiter.assignmentDetail.checkIn')}
                  variant="success"
                  loading={isBusy}
                  onPress={() => setConfirming('checkIn')}
                />
                <AppText variant="caption" align="center" color={colors.textMuted}>
                  {t('waiter.assignmentDetail.checkInHint')}
                </AppText>
              </>
            ) : (
              <Button
                label={t('waiter.assignmentDetail.checkOut')}
                variant="success"
                loading={isBusy}
                onPress={() => setConfirming('checkOut')}
              />
            )}
          </View>
        ) : undefined
      }>
      <ScreenHeader title={t('waiter.assignmentDetail.title')} onBack={navigation.goBack} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText variant="title" style={styles.title}>
            {jobPost.title}
          </AppText>
          <Badge label={t(statusLabelKey(assignment.status) as never)} tone={STATUS_TONE[assignment.status]} />
        </View>

        <View style={styles.infoRow}>
          <Icon name="calendar" size={18} color={colors.textMuted} />
          <View style={styles.infoTexts}>
            <AppText variant="body">{formatLongDate(jobPost.shiftStart)}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)}
            </AppText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="pin" size={18} color={colors.textMuted} />
          <View style={styles.infoTexts}>
            <AppText variant="body">{addressLine}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {cityLine}
            </AppText>
          </View>
        </View>

        <MapPreview location={jobPost.location} height={130} />

        <Card style={styles.amount}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('waiter.assignmentDetail.youReceive')}
          </AppText>
          <AppText variant="price" color={colors.primaryPressed}>
            {formatCurrency(assignment.payAmount)}
          </AppText>
        </Card>

        {assignment.checkInAt ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {t('waiter.assignmentDetail.checkedInAt', { time: formatTime(assignment.checkInAt) })}
          </AppText>
        ) : null}

        {assignment.checkOutAt ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {t('waiter.assignmentDetail.checkedOutAt', { time: formatTime(assignment.checkOutAt) })}
          </AppText>
        ) : null}

        {assignment.status === 'CheckedOut' && assignment.contestWindowEndsAt ? (
          <AppText variant="caption" color={colors.textMuted}>
            {t('waiter.assignmentDetail.contestWindow', {
              time: formatTime(assignment.contestWindowEndsAt),
            })}
          </AppText>
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirming === 'checkIn'}
        title={t('dialogs.checkIn.confirmTitle')}
        message={t('dialogs.checkIn.confirmMessage', { time: formatTime(new Date().toISOString()) })}
        confirmLabel={t('dialogs.checkIn.confirm')}
        onConfirm={() => void registerPoint('checkIn')}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmDialog
        visible={confirming === 'checkOut'}
        title={t('dialogs.checkOut.confirmTitle')}
        message={t('dialogs.checkOut.confirmMessage')}
        confirmLabel={t('dialogs.checkOut.confirm')}
        destructive
        onConfirm={() => void registerPoint('checkOut')}
        onCancel={() => setConfirming(null)}
      />
      <NoticeDialog
        visible={done !== null}
        title={done?.kind === 'checkOut' ? t('dialogs.checkOut.doneTitle') : t('dialogs.checkIn.doneTitle')}
        message={
          done?.kind === 'checkOut'
            ? t('dialogs.checkOut.doneMessage', { time: done.time })
            : t('dialogs.checkIn.doneMessage', { time: done?.time ?? '' })
        }
        onClose={() => setDone(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoTexts: { flex: 1, gap: 1 },
  amount: { gap: spacing.xxs },
  footer: { gap: spacing.sm },
  loading: { paddingVertical: spacing.huge },
});
