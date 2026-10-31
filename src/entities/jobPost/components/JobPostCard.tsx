import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Avatar, Card } from '../../../shared/components';
import { colors, spacing } from '../../../theme';
import {
  formatCurrency,
  formatDistanceKm,
  formatShortDate,
  formatTimeRange,
} from '../../../shared/utils/format';
import type { JobPost, NearbyJobPost } from '../types';

interface JobPostCardProps {
  jobPost: JobPost | NearbyJobPost;
  onPress: () => void;
}

/** Summary card in the waiter's nearby list. */
export function JobPostCard({ jobPost, onPress }: JobPostCardProps) {
  const { t } = useTranslation();
  const distanceMeters = 'distanceMeters' in jobPost ? jobPost.distanceMeters : null;

  const addressLine = [jobPost.address.street, jobPost.address.number]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} style={styles.card} flush>
      <View style={styles.companyHero}>
        <Avatar name={jobPost.companyName} uri={jobPost.companyLogoPath} size={36} />
        <View style={styles.companyTexts}>
          <AppText variant="captionStrong" color={colors.textOnDark} numberOfLines={1}>
            {jobPost.companyName}
          </AppText>
          <AppText variant="caption" color={colors.onHeroMuted}>
            Vaga #{jobPost.referenceCode}
          </AppText>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.details}>
          <View style={styles.titleRow}>
            <AppText variant="bodyStrong" numberOfLines={1} style={styles.title}>
              {jobPost.title}
            </AppText>
            {distanceMeters !== null ? (
              <View style={styles.distanceBadge}>
                <AppText variant="captionStrong" color={colors.primaryPressed}>
                  {t('common.distanceKm', { value: formatDistanceKm(distanceMeters) })}
                </AppText>
              </View>
            ) : null}
          </View>

          {addressLine ? (
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {addressLine}
            </AppText>
          ) : null}

          <AppText variant="caption" color={colors.textMuted}>
            {`${formatShortDate(jobPost.shiftStart)} · ${formatTimeRange(
              jobPost.shiftStart,
              jobPost.shiftEnd,
            )}`}
          </AppText>

          <View style={styles.footer}>
            <AppText variant="bodyStrong" color={colors.primaryPressed}>
              {formatCurrency(jobPost.payAmount)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t('common.waiterCount', { count: jobPost.slots })}
            </AppText>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {},
  companyHero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.heroBackground, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  companyTexts: { flex: 1, gap: spacing.xxs },
  row: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  details: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  distanceBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
