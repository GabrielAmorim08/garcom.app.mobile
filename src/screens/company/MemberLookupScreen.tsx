import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useInviteMember } from '../../entities/jobApplication/useJobApplications';
import { providerKindKey } from '../../entities/jobPost/providerKinds';
import type { JobPost } from '../../entities/jobPost/types';
import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';
import { KindStatsList } from '../../entities/user/components/KindStatsList';
import { useFindMember } from '../../entities/user/useUser';
import type { RootStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../shared/api/errorMessage';
import {
  AppText,
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  NoticeDialog,
  Screen,
  ScreenHeader,
  TextField,
} from '../../shared/components';
import {
  formatMemberNumber,
  formatRating,
  formatShortDate,
  formatTimeRange,
} from '../../shared/utils/format';
import { onlyDigits } from '../../shared/utils/masks';
import { colors, spacing } from '../../theme';

const MEMBER_NUMBER_LENGTH = 7;

/** A service can still take an invitation while it is published, has room and has not started. */
function canInviteTo(service: JobPost): boolean {
  return service.status === 'Published'
    && service.slotsFilled < service.slots
    && !service.startedAt
    && new Date(service.shiftStart).getTime() > Date.now();
}

/** Lets a company find a provider by the number on their member card and invite them to a service. */
export function MemberLookupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const lockedJobPostId = useRoute<RouteProp<RootStackParamList, 'MemberLookup'>>().params?.jobPostId;
  const { mutateAsync: findMember, data: member, isPending, reset } = useFindMember();
  const { mutateAsync: invite, isPending: isInviting } = useInviteMember();
  const { data: myServices } = useMyJobPosts();

  const [number, setNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<JobPost | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitedTo, setInvitedTo] = useState<JobPost | null>(null);

  const services = useMemo(
    () => (myServices?.items ?? []).filter(service => canInviteTo(service) && (!lockedJobPostId || service.id === lockedJobPostId)),
    [myServices?.items, lockedJobPostId],
  );

  async function search() {
    const digits = onlyDigits(number);
    if (!digits) {
      setError(t('member.lookup.invalid'));
      return;
    }

    setError(null);
    setInviteError(null);
    try {
      await findMember(Number(digits));
    } catch (caught) {
      setError(getErrorMessage(caught, t));
    }
  }

  async function sendInvitation() {
    if (!member || !chosen) {
      return;
    }

    setInviteError(null);
    try {
      await invite({ jobPostId: chosen.id, waiterUserId: member.userId });
      setInvitedTo(chosen);
    } catch (caught) {
      setInviteError(getErrorMessage(caught, t));
    } finally {
      setChosen(null);
    }
  }

  return (
    <Screen>
      <ScreenHeader title={t('member.lookup.title')} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label={t('member.lookup.label')}
          value={number}
          onChangeText={value => {
            setNumber(onlyDigits(value).slice(0, MEMBER_NUMBER_LENGTH));
            setError(null);
            setInviteError(null);
            reset();
          }}
          keyboardType="number-pad"
          maxLength={MEMBER_NUMBER_LENGTH}
          placeholder="0000050"
          error={error}
        />
        <Button label={t('member.lookup.action')} loading={isPending} onPress={search} />

        {member ? (
          <>
            <Card style={styles.card}>
              <View style={styles.header}>
                <Avatar name={member.fullName} uri={member.profilePhotoPath} size={64} />
                <View style={styles.headerCopy}>
                  <AppText variant="subtitle">{member.fullName}</AppText>
                  <AppText variant="captionStrong" color={colors.primaryPressed}>
                    {t('member.number', { number: formatMemberNumber(member.memberNumber) })}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted}>
                    {member.ratingsCount > 0
                      ? `${formatRating(member.averageRating)} · ${t('company.serviceDetail.reviewCount', { count: member.ratingsCount })}`
                      : t('company.serviceDetail.noReviews')}
                  </AppText>
                </View>
              </View>

              {member.providerKinds.length > 0 ? (
                <AppText variant="body" color={colors.textSecondary}>
                  {member.providerKinds
                    .map(kind => t(`serviceRequest.step1.providers.${providerKindKey(kind)}.label` as never))
                    .join(' · ')}
                </AppText>
              ) : null}

              <AppText variant="subtitle">{t('member.stats.title')}</AppText>
              <KindStatsList stats={member.kindStats} />
            </Card>

            <View style={styles.invite}>
              <AppText variant="subtitle">{t('member.invite.title')}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {t('member.invite.hint')}
              </AppText>

              {inviteError ? (
                <AppText variant="captionStrong" color={colors.danger}>
                  {inviteError}
                </AppText>
              ) : null}

              {services.length > 0 ? (
                services.map(service => (
                  <Card key={service.id} style={styles.service} onPress={() => setChosen(service)}>
                    <AppText variant="bodyStrong">{service.title}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {`${formatShortDate(service.shiftStart)} · ${formatTimeRange(service.shiftStart, service.shiftEnd)}`}
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {t('company.dashboard.serviceSlots', { filled: service.slotsFilled, total: service.slots })}
                    </AppText>
                  </Card>
                ))
              ) : (
                <AppText variant="body" color={colors.textSecondary}>
                  {t('member.invite.empty')}
                </AppText>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={chosen !== null}
        title={t('member.invite.confirmTitle')}
        message={t('member.invite.confirmMessage', {
          name: member?.fullName ?? '',
          service: chosen?.title ?? '',
        })}
        confirmLabel={t('member.invite.confirm')}
        loading={isInviting}
        onConfirm={() => { void sendInvitation(); }}
        onCancel={() => setChosen(null)}
      />

      <NoticeDialog
        visible={invitedTo !== null}
        title={t('member.invite.sentTitle')}
        message={t('member.invite.sentMessage', {
          name: member?.fullName ?? '',
          service: invitedTo?.title ?? '',
        })}
        onClose={() => setInvitedTo(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  invite: { gap: spacing.md },
  service: { gap: spacing.xxs },
});
