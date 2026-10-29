import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useApplyToJobPost } from '../../entities/jobApplication/useJobApplications';
import { useJobPost } from '../../entities/jobPost/useJobPosts';
import type { NearbyJobPost } from '../../entities/jobPost/types';
import {
  AppText,
  Badge,
  Button,
  Card,
  Icon,
  MapPreview,
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

export function ServiceDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ServiceDetail'>>();
  const { location } = useCurrentLocation({ autoRequest: true });

  const { data, isLoading, error } = useJobPost(params.jobPostId, location);
  const { mutateAsync: apply, isPending } = useApplyToJobPost();
  const [applyError, setApplyError] = useState<string | null>(null);

  const jobPost = data as NearbyJobPost | undefined;

  async function handleApply() {
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

    navigation.navigate('MyServices', { tab: 'applications' });
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
          <Button
            label={jobPost.hasApplied ? t('waiter.detail.alreadyApplied') : t('waiter.detail.apply')}
            disabled={jobPost.hasApplied}
            loading={isPending}
            onPress={handleApply}
          />
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

        <Card style={styles.contactCard}>
          <View style={styles.infoRow}>
            <Icon name="message" size={18} color={colors.textMuted} />
            <View style={styles.infoTexts}>
              <AppText variant="bodyStrong">{t('waiter.detail.talkToClient')}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {t('waiter.detail.talkToClientHint')}
              </AppText>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoTexts: { flex: 1, gap: 1 },
  section: { gap: spacing.xs },
  contactCard: { marginTop: spacing.xs },
  footer: { gap: spacing.sm },
  loading: { paddingVertical: spacing.huge },
});
