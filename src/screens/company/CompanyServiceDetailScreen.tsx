import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAcceptJobApplication, useCancelInvitation, useJobApplicants, useRejectJobApplication } from '../../entities/jobApplication/useJobApplications';
import type { JobApplicant } from '../../entities/jobApplication/types';
import type { JobAssignmentStatus, JobPostProvider } from '../../entities/jobAssignment/types';
import { useJobPost, useJobPostProviders, useStartJobPost, useUpdateJobPostStatus } from '../../entities/jobPost/useJobPosts';
import type { JobPostStatus } from '../../entities/jobPost/types';
import type { RootStackParamList } from '../../navigation/types';
import { AppText, Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, Icon, NoticeDialog, Screen, ScreenHeader, SegmentedControl, type SegmentOption } from '../../shared/components';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { formatCurrency, formatLongDate, formatRating, formatTime, formatTimeRange } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type DetailTab = 'team' | 'candidates';
type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';
type JobStatusKey = 'draft' | 'published' | 'filled' | 'cancelled' | 'completed';
type ProviderStatusKey = 'confirmed' | 'checkedIn' | 'checkedOut' | 'disputed' | 'completed' | 'noShow' | 'cancelled';

const jobStatusKey: Record<JobPostStatus, JobStatusKey> = { Draft: 'draft', Published: 'published', Filled: 'filled', Cancelled: 'cancelled', Completed: 'completed' };
const providerStatusKey: Record<JobAssignmentStatus, ProviderStatusKey> = { Confirmed: 'confirmed', CheckedIn: 'checkedIn', CheckedOut: 'checkedOut', Disputed: 'disputed', Completed: 'completed', NoShow: 'noShow', Cancelled: 'cancelled' };
const providerTone: Record<JobAssignmentStatus, BadgeTone> = { Confirmed: 'gold', CheckedIn: 'success', CheckedOut: 'success', Disputed: 'danger', Completed: 'neutral', NoShow: 'danger', Cancelled: 'neutral' };

export function CompanyServiceDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'CompanyServiceDetail'>>();
  const { data: jobPost, isLoading: loadingPost, error: jobError } = useJobPost(params.jobPostId);
  const { data: applicants, isLoading: loadingApplicants, error: applicantsError, refetch, isRefetching } = useJobApplicants(params.jobPostId);
  const { data: providers } = useJobPostProviders(params.jobPostId);
  const { mutateAsync: accept, isPending: accepting } = useAcceptJobApplication(params.jobPostId);
  const { mutateAsync: reject, isPending: rejecting } = useRejectJobApplication(params.jobPostId);
  const { mutateAsync: cancelInvite, isPending: cancellingInvite } = useCancelInvitation(params.jobPostId);
  const { mutateAsync: start, isPending: starting } = useStartJobPost(params.jobPostId);
  const { mutateAsync: updateStatus, isPending: updating } = useUpdateJobPostStatus();
  const [tab, setTab] = useState<DetailTab>('team');
  const [actionError, setActionError] = useState<string | null>(null);
  const [action, setAction] = useState<'start' | 'cancel' | 'complete' | null>(null);
  const [response, setResponse] = useState<{ id: string; action: 'accept' | 'reject'; name: string } | null>(null);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [inviteToCancel, setInviteToCancel] = useState<{ id: string; name: string } | null>(null);
  const pending = useMemo(() => (applicants ?? []).filter(item => item.status === 'Pending'), [applicants]);
  const invited = useMemo(() => (applicants ?? []).filter(item => item.status === 'Invited'), [applicants]);
  const history = useMemo(() => (applicants ?? []).filter(item => item.status !== 'Pending' && item.status !== 'Invited'), [applicants]);

  useEffect(() => {
    if (jobPost) setTab(jobPost.startedAt || pending.length + invited.length === 0 ? 'team' : 'candidates');
  }, [jobPost?.id, jobPost?.startedAt, pending.length, invited.length]);

  async function answer() {
    const next = response;
    setResponse(null);
    if (!next) return;
    try {
      setActionError(null);
      if (next.action === 'accept') {
        await accept(next.id);
        setNotice({ title: t('dialogs.accept.doneTitle'), message: t('dialogs.accept.doneMessage', { name: next.name }) });
      } else await reject(next.id);
    } catch (error) { setActionError(getErrorMessage(error, t)); }
  }

  async function confirmCancelInvite() {
    const next = inviteToCancel;
    setInviteToCancel(null);
    if (!next) return;
    try {
      setActionError(null);
      await cancelInvite(next.id);
    } catch (error) { setActionError(getErrorMessage(error, t)); }
  }

  async function runAction() {
    const next = action;
    setAction(null);
    if (!next) return;
    try {
      setActionError(null);
      if (next === 'start') {
        await start();
        setTab('team');
        setNotice({ title: t('dialogs.start.doneTitle'), message: t('dialogs.start.doneMessage') });
      } else await updateStatus({ id: params.jobPostId, action: next });
    } catch (error) { setActionError(getErrorMessage(error, t)); }
  }

  if (loadingPost || !jobPost) return <Screen><ScreenHeader onBack={navigation.goBack} /><AppText variant="caption" align="center" style={styles.loading}>{jobError ? getErrorMessage(jobError, t) : t('common.loading')}</AppText></Screen>;

  const address = [jobPost.address.street, jobPost.address.number].filter(Boolean).join(', ') || jobPost.address.city || '-';
  const isOpen = jobPost.status === 'Published' || jobPost.status === 'Filled';
  const hasEnded = new Date(jobPost.shiftEnd).getTime() <= Date.now();
  const started = Boolean(jobPost.startedAt);
  const canStart = isOpen && !hasEnded && !started && jobPost.slotsFilled > 0;
  const canCancel = isOpen && !hasEnded && !started;
  const canComplete = isOpen && hasEnded;
  const team = (providers ?? []).filter(provider => provider.status !== 'Cancelled');
  const tabs: SegmentOption<DetailTab>[] = [
    { value: 'team', label: t('company.serviceDetail.teamTab', { count: team.length }) },
    { value: 'candidates', label: t('company.serviceDetail.candidatesTab', { count: pending.length + invited.length }) },
  ];
  const footer = canStart ? <View style={styles.footer}><Button label={t('company.serviceDetail.startService')} loading={starting} onPress={() => setAction('start')} /><AppText variant="caption" align="center" color={colors.textMuted}>{t('company.serviceDetail.startHint')}</AppText></View> : canComplete ? <Button label={t('company.serviceDetail.completeService')} loading={updating} onPress={() => setAction('complete')} /> : undefined;

  return <Screen scrollable footer={footer} contentStyle={styles.content}>
    <ScreenHeader title={t('company.serviceDetail.title')} onBack={navigation.goBack} />
    <Card style={styles.summary}>
      <View style={styles.summaryHeader}><AppText variant="title" numberOfLines={2} style={styles.title}>{jobPost.title}</AppText><Badge tone={started ? 'success' : jobPost.status === 'Cancelled' ? 'neutral' : 'gold'} label={started ? t('company.serviceDetail.inProgress') : t(`serviceRequest.status.${jobStatusKey[jobPost.status]}`)} /></View>
      <SummaryLine icon="calendar" text={`${formatLongDate(jobPost.shiftStart)} · ${formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)}`} />
      <SummaryLine icon="pin" text={address} />
      <View style={styles.metrics}><Metric value={`${jobPost.slotsFilled}/${jobPost.slots}`} label={t('company.serviceDetail.confirmedTeam')} /><View style={styles.divider} /><Metric value={formatCurrency(jobPost.payAmount)} label={t('company.serviceDetail.perProvider')} /></View>
      {started && jobPost.startedAt ? <View style={styles.started}><Icon name="check" size={18} color={colors.success} /><AppText variant="captionStrong" color={colors.success}>{t('company.serviceDetail.startedAt', { time: formatTime(jobPost.startedAt) })}</AppText></View> : null}
    </Card>
    {actionError || applicantsError ? <AppText variant="caption" color={colors.danger}>{actionError ?? getErrorMessage(applicantsError, t)}</AppText> : null}
    <SegmentedControl options={tabs} value={tab} onChange={setTab} />
    {tab === 'team' ? <View style={styles.section}>
      <AppText variant="subtitle">{t('company.serviceDetail.confirmedTeamTitle')}</AppText>
      {team.length ? team.map(provider => <ProviderCard key={provider.assignmentId} provider={provider} />) : <EmptyState icon="users" title={t('company.serviceDetail.providersEmpty')} message={t('company.serviceDetail.providersEmptyHint')} />}
      {jobPost.slotsFilled < jobPost.slots ? <View style={styles.slotHint}><Icon name="note" size={18} color={colors.textMuted} /><AppText variant="caption" color={colors.textSecondary}>{t('company.serviceDetail.openSlotsHint', { count: jobPost.slots - jobPost.slotsFilled })}</AppText></View> : null}
    </View> : <View style={styles.section}>
      {jobPost.status === 'Published' && !hasEnded && !started ? <Button label={t('member.lookup.openCta')} variant="secondary" onPress={() => navigation.navigate('MemberLookup', { jobPostId: params.jobPostId })} /> : null}
      {invited.length ? <View style={styles.section}><AppText variant="subtitle">{t('company.serviceDetail.invitedTitle')}</AppText>{invited.map(item => <InvitedCard key={item.applicationId} applicant={item} loading={cancellingInvite} onPress={() => navigation.navigate('CandidateProfile', { jobPostId: params.jobPostId, applicant: item })} onCancel={() => setInviteToCancel({ id: item.applicationId, name: item.fullName })} />)}</View> : null}
      <AppText variant="subtitle">{t('company.serviceDetail.awaitingReview')}</AppText>
      {loadingApplicants ? <AppText variant="caption" align="center" style={styles.loading}>{t('common.loading')}</AppText> : pending.length ? pending.map(item => <ApplicantCard key={item.applicationId} applicant={item} onPress={() => navigation.navigate('CandidateProfile', { jobPostId: params.jobPostId, applicant: item })} onAccept={() => setResponse({ id: item.applicationId, action: 'accept', name: item.fullName })} onReject={() => setResponse({ id: item.applicationId, action: 'reject', name: item.fullName })} loading={accepting || rejecting} canAccept={jobPost.status === 'Published' && !hasEnded} />) : <EmptyState icon="users" title={t('company.serviceDetail.emptyApplicants')} message={t('company.serviceDetail.emptyApplicantsHint')} />}
      {history.length ? <View style={styles.history}><Icon name="users" size={18} color={colors.primaryPressed} /><AppText variant="bodyStrong">{t('company.serviceDetail.applicationHistory', { count: history.length })}</AppText><Icon name="chevronRight" size={18} color={colors.primaryPressed} /></View> : null}
    </View>}
    {canCancel ? <Button label={t('company.serviceDetail.cancelService')} variant="danger" loading={updating} onPress={() => setAction('cancel')} /> : null}
    <ConfirmDialog visible={action !== null} title={action === 'start' ? t('company.serviceDetail.startTitle') : action === 'cancel' ? t('dialogs.cancelService.title') : t('dialogs.completeService.title')} message={action === 'start' ? t('company.serviceDetail.startMessage') : action === 'cancel' ? t('dialogs.cancelService.message') : t('dialogs.completeService.message')} confirmLabel={action === 'start' ? t('company.serviceDetail.startConfirm') : action === 'cancel' ? t('dialogs.cancelService.confirm') : t('dialogs.completeService.confirm')} destructive={action === 'cancel'} onConfirm={() => void runAction()} onCancel={() => setAction(null)} />
    <ConfirmDialog visible={response !== null} title={t(response?.action === 'reject' ? 'dialogs.reject.confirmTitle' : 'dialogs.accept.confirmTitle', { name: response?.name ?? '' })} message={t(response?.action === 'reject' ? 'dialogs.reject.confirmMessage' : 'dialogs.accept.confirmMessage')} confirmLabel={t(response?.action === 'reject' ? 'dialogs.reject.confirm' : 'dialogs.accept.confirm')} destructive={response?.action === 'reject'} onConfirm={() => void answer()} onCancel={() => setResponse(null)} />
    <ConfirmDialog visible={inviteToCancel !== null} title={t('dialogs.cancelInvite.title', { name: inviteToCancel?.name ?? '' })} message={t('dialogs.cancelInvite.message')} confirmLabel={t('dialogs.cancelInvite.confirm')} destructive onConfirm={() => void confirmCancelInvite()} onCancel={() => setInviteToCancel(null)} />
    <NoticeDialog visible={notice !== null} title={notice?.title ?? ''} message={notice?.message} onClose={() => setNotice(null)} />
  </Screen>;
}

function SummaryLine({ icon, text }: { icon: 'calendar' | 'pin'; text: string }) { return <View style={styles.line}><Icon name={icon} size={18} color={colors.primaryPressed} /><AppText variant="body" color={colors.textSecondary} style={styles.lineText}>{text}</AppText></View>; }
function Metric({ value, label }: { value: string; label: string }) { return <View style={styles.metric}><AppText variant="subtitle">{value}</AppText><AppText variant="caption" color={colors.textMuted}>{label}</AppText></View>; }
function ProviderCard({ provider }: { provider: JobPostProvider }) { const { t } = useTranslation(); const sub = provider.checkInAt ? t('company.serviceDetail.checkInAt', { time: formatTime(provider.checkInAt) }) : provider.status === 'Confirmed' ? t('company.serviceDetail.awaitingCheckIn') : null; return <Card style={styles.personCard}><View style={styles.row}><Avatar name={provider.fullName} uri={provider.profilePhotoPath} size={42} /><View style={styles.personText}><AppText variant="bodyStrong">{provider.fullName}</AppText>{sub ? <AppText variant="caption" color={colors.textMuted}>{sub}</AppText> : null}</View><Badge tone={providerTone[provider.status]} label={t(`company.serviceDetail.providerStatus.${providerStatusKey[provider.status]}`)} /></View></Card>; }
function InvitedCard({ applicant, onPress, onCancel, loading }: { applicant: JobApplicant; onPress: () => void; onCancel: () => void; loading: boolean }) { const { t } = useTranslation(); return <Card style={styles.applicant}><Pressable onPress={onPress}><View style={styles.row}><Avatar name={applicant.fullName} uri={applicant.profilePhotoPath} size={48} /><View style={styles.personText}><AppText variant="bodyStrong">{applicant.fullName}</AppText><AppText variant="caption" color={colors.textMuted}>{t('company.serviceDetail.invitedWaiting')}</AppText></View><Badge tone="gold" label={t('company.serviceDetail.invitedBadge')} /></View></Pressable><Button label={t('company.serviceDetail.cancelInvite')} variant="secondary" size="md" onPress={onCancel} disabled={loading} /></Card>; }
function ApplicantCard({ applicant, onPress, onAccept, onReject, loading, canAccept }: { applicant: JobApplicant; onPress: () => void; onAccept: () => void; onReject: () => void; loading: boolean; canAccept: boolean }) { const { t } = useTranslation(); return <Card style={styles.applicant}><Pressable onPress={onPress}><View style={styles.row}><Avatar name={applicant.fullName} uri={applicant.profilePhotoPath} size={48} /><View style={styles.personText}><AppText variant="bodyStrong">{applicant.fullName}</AppText><AppText variant="caption" color={colors.textMuted}>{applicant.ratingsCount ? `${formatRating(applicant.averageRating)} · ${t('company.serviceDetail.reviewCount', { count: applicant.ratingsCount })}` : t('company.serviceDetail.noReviews')}</AppText><AppText variant="caption" color={colors.primary}>{t('company.serviceDetail.viewProfile')}</AppText></View></View></Pressable>{applicant.message ? <AppText variant="caption" color={colors.textSecondary}>{applicant.message}</AppText> : null}<View style={styles.actions}><Button label={t('company.serviceDetail.reject')} variant="secondary" size="md" onPress={onReject} disabled={loading} /><Button label={t('company.serviceDetail.accept')} size="md" onPress={onAccept} loading={loading} disabled={!canAccept || loading} /></View></Card>; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg }, loading: { paddingVertical: spacing.huge }, summary: { gap: spacing.md }, summaryHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, title: { flex: 1, minWidth: 0 }, line: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, lineText: { flex: 1 }, metrics: { flexDirection: 'row', paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, metric: { flex: 1, gap: 2, alignItems: 'center' }, divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border }, started: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 10, padding: spacing.sm, backgroundColor: colors.successSoft }, section: { gap: spacing.md }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, personText: { flex: 1, gap: 2 }, personCard: { paddingVertical: spacing.md }, applicant: { gap: spacing.md }, actions: { flexDirection: 'row', gap: spacing.md }, slotHint: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingTop: spacing.sm }, history: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }, footer: { gap: spacing.sm },
});
