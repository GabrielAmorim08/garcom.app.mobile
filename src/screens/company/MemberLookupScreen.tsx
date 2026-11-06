import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useInviteMember } from '../../entities/jobApplication/useJobApplications';
import { providerKindKey } from '../../entities/jobPost/providerKinds';
import type { JobPost } from '../../entities/jobPost/types';
import { useMyJobPosts } from '../../entities/jobPost/useJobPosts';
import { KindStatsList } from '../../entities/user/components/KindStatsList';
import type { WaiterCard } from '../../entities/user/types';
import { useSearchMembers } from '../../entities/user/useUser';
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
import { colors, spacing } from '../../theme';

const MAX_QUERY_LENGTH = 60;

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
  const { mutateAsync: searchMembers, data: results, isPending, reset } = useSearchMembers();
  const { mutateAsync: invite, isPending: isInviting } = useInviteMember();
  const { data: myServices } = useMyJobPosts();

  const [text, setText] = useState('');
  const [picked, setPicked] = useState<WaiterCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<JobPost | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitedTo, setInvitedTo] = useState<JobPost | null>(null);

  const services = useMemo(
    () => (myServices?.items ?? []).filter(service => canInviteTo(service) && (!lockedJobPostId || service.id === lockedJobPostId)),
    [myServices?.items, lockedJobPostId],
  );

  const member = picked ?? (results?.length === 1 ? results[0] : null);

  async function search() {
    const query = text.trim();
    if (!query) {
      setError(t('member.lookup.invalid'));
      return;
    }

    setError(null);
    setInviteError(null);
    setPicked(null);
    try {
      await searchMembers(query);
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
          value={text}
          onChangeText={value => {
            setText(value);
            setError(null);
            setInviteError(null);
            setPicked(null);
            reset();
          }}
          maxLength={MAX_QUERY_LENGTH}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={() => { void search(); }}
          placeholder={t('member.lookup.placeholder')}
          error={error}
        />
        <Button label={t('member.lookup.action')} loading={isPending} onPress={search} />

        {results && results.length === 0 ? (
          <AppText variant="body" color={colors.textSecondary}>
            {t('member.lookup.empty')}
          </AppText>
        ) : null}

        {results && results.length > 1 && !picked ? (
          <View style={styles.invite}>
            <AppText variant="subtitle">{t('member.lookup.results', { count: results.length })}</AppText>
            {results.map(item => (
              <Card key={item.userId} style={styles.result} onPress={() => setPicked(item)}>
                <Avatar name={item.fullName} uri={item.profilePhotoPath} size={44} />
                <View style={styles.headerCopy}>
                  <AppText variant="bodyStrong">{item.fullName}</AppText>
                  <AppText variant="caption" color={colors.primaryPressed}>
                    {t('member.number', { number: formatMemberNumber(item.memberNumber) })}
                  </AppText>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

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
  result: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
