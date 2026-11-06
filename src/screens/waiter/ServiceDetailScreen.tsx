import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useApplyToJobPost } from '../../entities/jobApplication/useJobApplications';
import type { JobApplicationStatus } from '../../entities/jobApplication/types';
import { useAnswerInvitation, useMyApplications } from '../../entities/jobApplication/useWaiterApplications';
import { useOpenChatConversation } from '../../entities/chat/useChat';
import { useAuthStore } from '../../entities/auth/authStore';
import { useJobPost } from '../../entities/jobPost/useJobPosts';
import type { NearbyJobPost } from '../../entities/jobPost/types';
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
  durationInHours,
  formatCurrency,
  formatDistanceKm,
  formatLongDate,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../shared/api/errorMessage';

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

export function ServiceDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const { location } = useCurrentLocation({ autoRequest: true });

  const { data, isLoading, error } = useJobPost(params.jobPostId, location);
  const { mutateAsync: apply, isPending } = useApplyToJobPost();
  const { mutateAsync: openConversation, isPending: isOpeningConversation } = useOpenChatConversation();
  const userId = useAuthStore(state => state.user?.id);
  const { data: myApplications } = useMyApplications();
  const { mutateAsync: answerInvitation, isPending: isAnswering } = useAnswerInvitation();
  const [applyError, setApplyError] = useState<string | null>(null);
  const [confirmingApply, setConfirmingApply] = useState(false);
  const [applied, setApplied] = useState(false);

  const jobPost = data as NearbyJobPost | undefined;

  async function handleApply() {
    setConfirmingApply(false);

    if (!jobPost) {
      return;
    }

    setApplyError(null);

    try {
      await apply({
        jobPostId: jobPost.id,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
    } catch (failure) {
      setApplyError(getErrorMessage(failure, t));
      return;
    }

    setApplied(true);
  }

  const invitation = (myApplications?.items ?? []).find(
    item => item.jobPostId === params.jobPostId && item.status === 'Invited',
  );
  const canAnswerInvitation = Boolean(invitation)
    && Boolean(data)
    && new Date(data!.shiftStart).getTime() > Date.now();

  async function answer(accept: boolean) {
    if (!invitation) return;
    setApplyError(null);
    try {
      await answerInvitation({ applicationId: invitation.id, accept });
      if (!accept) navigation.goBack();
    } catch (failure) {
      setApplyError(getErrorMessage(failure, t));
    }
  }

  function closeAppliedNotice() {
    setApplied(false);
    navigation.navigate('MyServices', { tab: 'applications' });
  }

  async function startConversation() {
    if (!jobPost || !userId) return;
    try {
      const conversation = await openConversation({ jobPostId: jobPost.id, waiterUserId: userId });
      navigation.navigate('ChatConversation', {
        conversationId: conversation.id,
        title: jobPost.companyName,
        context: `Vaga #${conversation.jobReferenceCode} · ${conversation.jobTitle}`,
      });
    } catch {
      Alert.alert('Não foi possível iniciar a conversa', 'Tente novamente em instantes.');
    }
  }

  if (isLoading || !jobPost) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <AppText variant="caption" align="center" style={styles.loading}>
          {error ? getErrorMessage(error, t) : t('common.loading')}
        </AppText>
      </Screen>
    );
  }

  const hours = durationInHours(jobPost.shiftStart, jobPost.shiftEnd);
  const addressLine = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ');
  const cityLine = [jobPost.address.district, jobPost.address.city, jobPost.address.state]
    .filter(Boolean)
    .join(', ');
  const applicationStatus = jobPost.applicationStatus;

  return (
    <Screen
      scrollable
      footer={
        <View style={styles.footer}>
          {applyError ? (
            <AppText variant="caption" color={colors.danger} align="center">
              {applyError}
            </AppText>
          ) : null}
          {canAnswerInvitation ? (
            <>
              <AppText variant="caption" color={colors.textSecondary} align="center">
                {t('waiter.invitation.hint', { company: jobPost.companyName })}
              </AppText>
              <View style={styles.answer}>
                <View style={styles.answerButton}>
                  <Button label={t('waiter.invitation.decline')} variant="secondary" disabled={isAnswering} onPress={() => { void answer(false); }} />
                </View>
                <View style={styles.answerButton}>
                  <Button label={t('waiter.invitation.accept')} loading={isAnswering} onPress={() => { void answer(true); }} />
                </View>
              </View>
            </>
          ) : jobPost.hasApplied ? (
            <Button
              label="Conversar com a empresa"
              icon={<Icon name="message" size={19} color={colors.onPrimary} />}
              loading={isOpeningConversation}
              onPress={() => { startConversation(); }}
            />
          ) : (
            <Button
              label={t('waiter.detail.apply')}
              loading={isPending}
              onPress={() => setConfirmingApply(true)}
            />
          )}
          <AppText variant="caption" color={colors.textMuted} align="center">
            {t('waiter.detail.applyHint')}
          </AppText>
        </View>
      }>
      <ScreenHeader
        onBack={navigation.goBack}
        right={
          typeof jobPost.distanceMeters === 'number' ? (
            <Badge
              tone="gold"
              label={t('common.distanceFromYou', {
                value: formatDistanceKm(jobPost.distanceMeters),
              })}
            />
          ) : undefined
        }
      />

      <View style={styles.content}>
        <AppText variant="title">{jobPost.title}</AppText>

        {applicationStatus ? (
          <View style={styles.applicationStatus}>
            <View style={styles.applicationStatusText}>
              <Icon name="note" size={18} color={colors.primaryPressed} />
              <View>
                <AppText variant="caption" color={colors.textMuted}>
                  {t('waiter.detail.applicationStatusLabel')}
                </AppText>
                <AppText variant="bodyStrong">
                  {t(`waiter.application.status.${applicationStatus.toLowerCase()}` as never)}
                </AppText>
              </View>
            </View>
            <Badge
              label={t(`waiter.application.status.${applicationStatus.toLowerCase()}` as never)}
              tone={APPLICATION_TONE[applicationStatus]}
            />
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <Icon name="calendar" size={18} color={colors.textMuted} />
          <View style={styles.infoTexts}>
            <AppText variant="body">{formatLongDate(jobPost.shiftStart)}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {`${formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)} (${t('common.hoursShort', {
                count: hours,
              })})`}
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

        <View style={styles.infoRow}>
          <Icon name="users" size={18} color={colors.textMuted} />
          <AppText variant="body">
            {t('waiter.detail.waitersNeeded', { count: jobPost.slots })}
          </AppText>
        </View>

        <View style={styles.infoRow}>
          <Icon name="star" size={18} color={colors.primary} filled />
          <View style={styles.infoTexts}>
            <AppText variant="price" color={colors.primaryPressed}>
              {formatCurrency(jobPost.payAmount)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t('waiter.detail.perProvider')}
            </AppText>
          </View>
        </View>

        {jobPost.description ? (
          <View style={styles.section}>
            <AppText variant="bodyStrong">{t('waiter.detail.description')}</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {jobPost.description}
            </AppText>
          </View>
        ) : null}

        <Card
          onPress={jobPost.hasApplied ? () => { startConversation(); } : undefined}
          style={[styles.contactCard, !jobPost.hasApplied ? styles.contactCardDisabled : null]}>
          <View style={styles.infoRow}>
            <Icon name="message" size={18} color={colors.textMuted} />
            <View style={styles.infoTexts}>
              <AppText variant="bodyStrong">{t('waiter.detail.talkToClient')}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {jobPost.hasApplied
                  ? 'Toque para abrir a conversa sobre esta vaga.'
                  : 'Candidate-se para conversar com a empresa.'}
              </AppText>
            </View>
          </View>
        </Card>
      </View>

      <ConfirmDialog
        visible={confirmingApply}
        title={t('dialogs.apply.confirmTitle')}
        message={t('dialogs.apply.confirmMessage')}
        details={[
          { label: t('dialogs.apply.service'), value: jobPost.title },
          {
            label: t('dialogs.apply.when'),
            value: `${formatLongDate(jobPost.shiftStart)} · ${formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)}`,
          },
          { label: t('dialogs.apply.pay'), value: formatCurrency(jobPost.payAmount) },
        ]}
        confirmLabel={t('dialogs.apply.confirm')}
        onConfirm={() => void handleApply()}
        onCancel={() => setConfirmingApply(false)}
      />
      <NoticeDialog
        visible={applied}
        title={t('dialogs.apply.doneTitle')}
        message={t('dialogs.apply.doneMessage')}
        onClose={closeAppliedNotice}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoTexts: { flex: 1, gap: 1 },
  applicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
  },
  applicationStatusText: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  section: { gap: spacing.xs },
  contactCard: { marginTop: spacing.xs },
  contactCardDisabled: { opacity: 0.62 },
  footer: { gap: spacing.sm },
  answer: { flexDirection: 'row', gap: spacing.md },
  answerButton: { flex: 1 },
  loading: { paddingVertical: spacing.huge },
});
