import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Card } from '../../../shared/components';
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

/** Row in the waiter's nearby list: distance on the left, details, pay, headcount. */
export function JobPostCard({ jobPost, onPress }: JobPostCardProps) {
  const { t } = useTranslation();
  const distanceMeters = 'distanceMeters' in jobPost ? jobPost.distanceMeters : null;

  const addressLine = [jobPost.address.street, jobPost.address.number]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {distanceMeters !== null ? (
          <AppText variant="captionStrong" color={colors.primaryPressed} style={styles.distance}>
            {t('common.distanceKm', { value: formatDistanceKm(distanceMeters) })}
          </AppText>
        ) : null}

        <View style={styles.details}>
          <AppText variant="bodyStrong">{jobPost.title}</AppText>

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
  card: { paddingVertical: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.lg },
  distance: { width: 48, paddingTop: 2 },
  details: { flex: 1, gap: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
