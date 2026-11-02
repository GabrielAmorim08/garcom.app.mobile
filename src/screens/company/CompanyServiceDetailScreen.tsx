import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import {
  useAcceptJobApplication,
  useJobApplicants,
  useRejectJobApplication,
} from '../../entities/jobApplication/useJobApplications';
import type { JobApplicant } from '../../entities/jobApplication/types';
import type { JobAssignmentStatus, JobPostProvider } from '../../entities/jobAssignment/types';
import {
  useJobPost,
  useJobPostProviders,
  useStartJobPost,
  useUpdateJobPostStatus,
} from '../../entities/jobPost/useJobPosts';
import type { RootStackParamList } from '../../navigation/types';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ListSeparator,
  NoticeDialog,
  Screen,
  ScreenHeader,
} from '../../shared/components';
import {
  formatCurrency,
  formatDistanceKm,
  formatLongDate,
  formatRating,
  formatTime,
  formatTimeRange,
} from '../../shared/utils/format';
import { colors, spacing } from '../../theme';
import type { JobPostStatus } from '../../entities/jobPost/types';
import type { JobApplicationStatus } from '../../entities/jobApplication/types';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { useState } from 'react';

type JobStatusKey = 'draft' | 'published' | 'filled' | 'cancelled' | 'completed';
type ApplicationStatusKey = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'cancelled';

const jobPostStatusTranslationKey: Record<JobPostStatus, JobStatusKey> = {
  Draft: 'draft',
  Published: 'published',
  Filled: 'filled',
  Cancelled: 'cancelled',
  Completed: 'completed',
};

type ProviderStatusKey =
  | 'confirmed'
  | 'checkedIn'
  | 'checkedOut'
  | 'disputed'
  | 'completed'
  | 'noShow'
  | 'cancelled';
type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';

const providerStatusTranslationKey: Record<JobAssignmentStatus, ProviderStatusKey> = {
  Confirmed: 'confirmed',
  CheckedIn: 'checkedIn',
  CheckedOut: 'checkedOut',
  Disputed: 'disputed',
  Completed: 'completed',
  NoShow: 'noShow',
  Cancelled: 'cancelled',
};

const providerStatusTone: Record<JobAssignmentStatus, BadgeTone> = {
  Confirmed: 'gold',
  CheckedIn: 'success',
  CheckedOut: 'success',
  Disputed: 'danger',
  Completed: 'neutral',
  NoShow: 'danger',
  Cancelled: 'neutral',
};

const applicationStatusTranslationKey: Record<JobApplicationStatus, ApplicationStatusKey> = {
  Pending: 'pending',
  Accepted: 'accepted',
  Rejected: 'rejected',
  Withdrawn: 'withdrawn',
  Cancelled: 'cancelled',
};

export function CompanyServiceDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'CompanyServiceDetail'>>();

  const { data: jobPost, isLoading: isLoadingJobPost, error: jobPostError } = useJobPost(params.jobPostId);
  const { data: applicants, isLoading: isLoadingApplicants, error: applicantsError, refetch, isRefetching } =
    useJobApplicants(params.jobPostId);
  const { mutateAsync: accept, isPending: isAccepting } = useAcceptJobApplication(params.jobPostId);
  const { mutateAsync: reject, isPending: isRejecting } = useRejectJobApplication(params.jobPostId);
  const { data: providers } = useJobPostProviders(params.jobPostId);
  const { mutateAsync: startService, isPending: isStarting } = useStartJobPost(params.jobPostId);
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateJobPostStatus();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'start' | 'cancel' | 'complete' | null>(null);
  const [pendingResponse, setPendingResponse] = useState<{
    applicationId: string;
    action: 'accept' | 'reject';
    name: string;
  } | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);

  async function respond() {
    const response = pendingResponse;
    setPendingResponse(null);
    if (!response) {
      return;
    }

    setActionError(null);
    try {
      if (response.action === 'accept') {
        await accept(response.applicationId);
        setNotice({
          title: t('dialogs.accept.doneTitle'),
          message: t('dialogs.accept.doneMessage', { name: response.name }),
        });
      } else {
        await reject(response.applicationId);
      }
    } catch (error) {
      setActionError(getErrorMessage(error, t));
    }
  }

  async function runPendingAction() {
    const action = pendingAction;
    setPendingAction(null);
    if (!action) {
      return;
    }

    setActionError(null);
    try {
      if (action === 'start') {
        await startService();
        setNotice({ title: t('dialogs.start.doneTitle'), message: t('dialogs.start.doneMessage') });
      } else {
        await updateStatus({ id: params.jobPostId, action });
      }
    } catch (error) {
      setActionError(getErrorMessage(error, t));
    }
  }

  if (isLoadingJobPost || !jobPost) {
    return (
      <Screen>
        <ScreenHeader onBack={navigation.goBack} />
        <AppText variant="caption" align="center" style={styles.loading}>
          {jobPostError ? getErrorMessage(jobPostError, t) : t('common.loading')}
        </AppText>
      </Screen>
    );
  }

  const addressLine = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ');
  const cityLine = [jobPost.address.district, jobPost.address.city, jobPost.address.state]
    .filter(Boolean)
    .join(', ');
  const statusKey = jobPostStatusTranslationKey[jobPost.status];
  const isOpen = jobPost.status === 'Published' || jobPost.status === 'Filled';
  const hasEnded = new Date(jobPost.shiftEnd).getTime() <= Date.now();
  const isStarted = Boolean(jobPost.startedAt);
  const canStart = isOpen && !hasEnded && !isStarted && jobPost.slotsFilled > 0;
  const canCancel = isOpen && !hasEnded && !isStarted;

  return (
    <Screen>
      <ScreenHeader title={t('company.serviceDetail.title')} onBack={navigation.goBack} />

      <FlatList
        data={applicants ?? []}
        keyExtractor={item => item.applicationId}
        onRefresh={refetch}
        refreshing={isRefetching}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <Card style={styles.summary}>
              <View style={styles.summaryHeader}>
                <AppText variant="title" numberOfLines={2} ellipsizeMode="tail" style={styles.summaryTitle}>
                  {jobPost.title}
                </AppText>
                <Badge tone="gold" label={t(`serviceRequest.status.${statusKey}`)} />
              </View>

              <AppText variant="body" color={colors.textSecondary}>
                {`${formatLongDate(jobPost.shiftStart)} · ${formatTimeRange(
                  jobPost.shiftStart,
                  jobPost.shiftEnd,
                )}`}
              </AppText>

              <AppText variant="body" color={colors.textSecondary}>
                {[addressLine, cityLine].filter(Boolean).join(' · ')}
              </AppText>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <AppText variant="caption" color={colors.textMuted}>
                    {t('serviceRequest.step3.waiterQuantity')}
                  </AppText>
                  <AppText variant="bodyStrong">
                    {`${jobPost.slotsFilled}/${jobPost.slots}`}
                  </AppText>
                </View>
                <View style={styles.metric}>
                  <AppText variant="caption" color={colors.textMuted}>
                    {t('serviceRequest.step3.estimatedValue')}
                  </AppText>
                  <AppText variant="bodyStrong">{formatCurrency(jobPost.payAmount)}</AppText>
                </View>
              </View>
            </Card>

            {isOpen ? (
              <View style={styles.lifecycleActions}>
                {isStarted && jobPost.startedAt ? (
                  <AppText variant="caption" color={colors.textSecondary}>
                    {t('company.serviceDetail.startedAt', { time: formatTime(jobPost.startedAt) })}
                  </AppText>
                ) : null}
                {canStart ? (
                  <Button label={t('company.serviceDetail.startService')} loading={isStarting} onPress={() => setPendingAction('start')} />
                ) : null}
                {hasEnded ? (
                  <Button label="Encerrar serviço" loading={isUpdatingStatus} onPress={() => setPendingAction('complete')} />
                ) : null}
                {canCancel ? (
                  <Button label="Cancelar serviço" variant="danger" loading={isUpdatingStatus} onPress={() => setPendingAction('cancel')} />
                ) : null}
              </View>
            ) : null}

            {isOpen || (providers?.length ?? 0) > 0 ? (
              <View style={styles.providers}>
                <AppText variant="subtitle">{t('company.serviceDetail.providers')}</AppText>
                {(providers ?? []).length === 0 ? (
                  <AppText variant="caption" color={colors.textMuted}>
                    {`${t('company.serviceDetail.providersEmpty')}. ${t('company.serviceDetail.providersEmptyHint')}`}
                  </AppText>
                ) : (
                  (providers ?? []).map(provider => (
                    <ProviderCard key={provider.assignmentId} provider={provider} />
                  ))
                )}
              </View>
            ) : null}

            <AppText variant="subtitle">{t('company.serviceDetail.applicants')}</AppText>
            {actionError || applicantsError ? (
              <AppText variant="caption" color={colors.danger}>
                {actionError ?? getErrorMessage(applicantsError, t)}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ApplicantCard
            applicant={item}
            onPress={() => navigation.navigate('CandidateProfile', { jobPostId: params.jobPostId, applicant: item })}
            onAccept={() => setPendingResponse({ applicationId: item.applicationId, action: 'accept', name: item.fullName })}
            onReject={() => setPendingResponse({ applicationId: item.applicationId, action: 'reject', name: item.fullName })}
            loading={isAccepting || isRejecting}
            canAccept={jobPost.status === 'Published' && new Date(jobPost.shiftEnd).getTime() > Date.now()}
          />
        )}
        ListEmptyComponent={
          isLoadingApplicants ? (
            <AppText variant="caption" align="center" style={styles.loading}>
              {t('common.loading')}
            </AppText>
          ) : (
            <EmptyState
              icon="users"
              title={t('company.serviceDetail.emptyApplicants')}
              message={t('company.serviceDetail.emptyApplicantsHint')}
            />
          )
        }
      />

      <ConfirmDialog
        visible={pendingAction !== null}
        title={
          pendingAction === 'start'
            ? t('company.serviceDetail.startTitle')
            : pendingAction === 'cancel'
              ? t('dialogs.cancelService.title')
              : t('dialogs.completeService.title')
        }
        message={
          pendingAction === 'start'
            ? t('company.serviceDetail.startMessage')
            : pendingAction === 'cancel'
              ? t('dialogs.cancelService.message')
              : t('dialogs.completeService.message')
        }
        confirmLabel={
          pendingAction === 'start'
            ? t('company.serviceDetail.startConfirm')
            : pendingAction === 'cancel'
              ? t('dialogs.cancelService.confirm')
              : t('dialogs.completeService.confirm')
        }
        destructive={pendingAction === 'cancel'}
        onConfirm={() => void runPendingAction()}
        onCancel={() => setPendingAction(null)}
      />
      <ConfirmDialog
        visible={pendingResponse !== null}
        title={t(
          pendingResponse?.action === 'reject' ? 'dialogs.reject.confirmTitle' : 'dialogs.accept.confirmTitle',
          { name: pendingResponse?.name ?? '' },
        )}
        message={t(
          pendingResponse?.action === 'reject' ? 'dialogs.reject.confirmMessage' : 'dialogs.accept.confirmMessage',
        )}
        confirmLabel={t(pendingResponse?.action === 'reject' ? 'dialogs.reject.confirm' : 'dialogs.accept.confirm')}
        destructive={pendingResponse?.action === 'reject'}
        onConfirm={() => void respond()}
        onCancel={() => setPendingResponse(null)}
      />
      <NoticeDialog
        visible={notice !== null}
        title={notice?.title ?? ''}
        message={notice?.message}
        onClose={() => setNotice(null)}
      />
    </Screen>
  );
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${formatDistanceKm(meters)} km`;
}

function ProviderCard({ provider }: { provider: JobPostProvider }) {
  const { t } = useTranslation();
  const statusKey = providerStatusTranslationKey[provider.status];
  const checkInLine = provider.checkInAt
    ? [
        t('company.serviceDetail.checkInAt', { time: formatTime(provider.checkInAt) }),
        provider.checkInDistanceMeters !== null
          ? t('company.serviceDetail.distanceFromVenue', {
              distance: formatDistance(provider.checkInDistanceMeters),
            })
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <Card style={styles.provider}>
      <View style={styles.applicantHeader}>
        <Avatar name={provider.fullName} uri={provider.profilePhotoPath} size={40} />
        <View style={styles.applicantText}>
          <AppText variant="bodyStrong">{provider.fullName}</AppText>
          {!provider.checkInAt && provider.status === 'Confirmed' ? (
            <AppText variant="caption" color={colors.textMuted}>
              {t('company.serviceDetail.awaitingCheckIn')}
            </AppText>
          ) : null}
        </View>
        <Badge
          tone={providerStatusTone[provider.status]}
          label={t(`company.serviceDetail.providerStatus.${statusKey}`)}
        />
      </View>

      {checkInLine ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {checkInLine}
        </AppText>
      ) : null}

      {provider.checkOutAt ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {t('company.serviceDetail.checkOutAt', { time: formatTime(provider.checkOutAt) })}
        </AppText>
      ) : null}
    </Card>
  );
}

interface ApplicantCardProps {
  applicant: JobApplicant;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  loading: boolean;
  canAccept: boolean;
}

function ApplicantCard({ applicant, onPress, onAccept, onReject, loading, canAccept }: ApplicantCardProps) {
  const { t } = useTranslation();
  const isPending = applicant.status === 'Pending';
  const statusKey = applicationStatusTranslationKey[applicant.status];

  return (
    <Card style={styles.applicant}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver perfil de ${applicant.fullName}`}>
      <View style={styles.applicantHeader}>
        <Avatar name={applicant.fullName} uri={applicant.profilePhotoPath} size={48} />
        <View style={styles.applicantText}>
          <AppText variant="bodyStrong">{applicant.fullName}</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {`${formatRating(applicant.averageRating)} · ${t('company.serviceDetail.reviewCount', {
              count: applicant.ratingsCount,
            })}`}
          </AppText>
        </View>
        <Badge
          tone={isPending ? 'gold' : 'neutral'}
          label={t(`company.serviceDetail.applicationStatus.${statusKey}`)}
        />
      </View>

      <AppText variant="caption" color={colors.primary} style={styles.viewProfile}>
        Ver perfil completo
      </AppText>
      </Pressable>

      {applicant.message ? (
        <AppText variant="body" color={colors.textSecondary}>
          {applicant.message}
        </AppText>
      ) : null}

      {isPending ? (
        <View style={styles.actions}>
          <Button
            label={t('company.serviceDetail.reject')}
            variant="secondary"
            size="md"
            onPress={onReject}
            disabled={loading}
          />
          <Button
            label={t('company.serviceDetail.accept')}
            size="md"
            onPress={onAccept}
            loading={loading}
            disabled={!canAccept || loading}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  headerContent: { gap: spacing.lg, paddingBottom: spacing.md },
  summary: { gap: spacing.md },
  summaryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  summaryTitle: { flex: 1, minWidth: 0, flexShrink: 1 },
  metrics: { flexDirection: 'row', gap: spacing.md },
  lifecycleActions: { gap: spacing.sm },
  providers: { gap: spacing.md },
  provider: { gap: spacing.sm },
  metric: { flex: 1, gap: spacing.xs },
  applicant: { gap: spacing.md },
  applicantHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  applicantText: { flex: 1, gap: spacing.xs },
  viewProfile: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md },
  loading: { paddingVertical: spacing.huge },
});
