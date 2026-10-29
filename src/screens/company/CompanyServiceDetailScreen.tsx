import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import {
  useAcceptJobApplication,
  useJobApplicants,
  useRejectJobApplication,
} from '../../entities/jobApplication/useJobApplications';
import type { JobApplicant } from '../../entities/jobApplication/types';
import { useJobPost } from '../../entities/jobPost/useJobPosts';
import type { RootStackParamList } from '../../navigation/types';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ListSeparator,
  Screen,
  ScreenHeader,
} from '../../shared/components';
import {
  formatCurrency,
  formatLongDate,
  formatRating,
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
  const [actionError, setActionError] = useState<string | null>(null);

  async function respond(applicationId: string, action: 'accept' | 'reject') {
    setActionError(null);
    try {
      if (action === 'accept') {
        await accept(applicationId);
      } else {
        await reject(applicationId);
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
                <AppText variant="title">{jobPost.title}</AppText>
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
            onAccept={() => respond(item.applicationId, 'accept')}
            onReject={() => respond(item.applicationId, 'reject')}
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
    </Screen>
  );
}

interface ApplicantCardProps {
  applicant: JobApplicant;
  onAccept: () => void;
  onReject: () => void;
  loading: boolean;
  canAccept: boolean;
}

function ApplicantCard({ applicant, onAccept, onReject, loading, canAccept }: ApplicantCardProps) {
  const { t } = useTranslation();
  const isPending = applicant.status === 'Pending';
  const statusKey = applicationStatusTranslationKey[applicant.status];

  return (
    <Card style={styles.applicant}>
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
  summaryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metrics: { flexDirection: 'row', gap: spacing.md },
  metric: { flex: 1, gap: spacing.xs },
  applicant: { gap: spacing.md },
  applicantHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  applicantText: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md },
  loading: { paddingVertical: spacing.huge },
});
