import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, Icon } from '../../../shared/components';
import { colors, spacing } from '../../../theme';
import { relativeDayLabel } from '../../../shared/utils/date';
import { formatShortDate, formatTimeRange } from '../../../shared/utils/format';
import type { JobAssignmentWithPost } from '../types';

interface AssignmentRowProps {
  assignment: JobAssignmentWithPost;
  onPress: () => void;
}

/**
 * Row on "Meus serviços": the date block on the left, the shift in the middle,
 * a chevron on the right.
 */
export function AssignmentRow({ assignment, onPress }: AssignmentRowProps) {
  const { jobPost } = assignment;

  const addressLine = [jobPost.address.street, jobPost.address.number]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.dateBlock}>
          <AppText variant="captionStrong" color={colors.primaryPressed} align="center">
            {relativeDayLabel(jobPost.shiftStart)}
          </AppText>
          <AppText variant="overline" color={colors.textMuted} align="center">
            {formatShortDate(jobPost.shiftStart).split(' ')[1] ?? ''}
          </AppText>
        </View>

        <View style={styles.details}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {jobPost.title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {formatTimeRange(jobPost.shiftStart, jobPost.shiftEnd)}
          </AppText>
          {addressLine ? (
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {addressLine}
            </AppText>
          ) : null}
        </View>

        <Icon name="chevronRight" size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  dateBlock: { width: 52, gap: 1 },
  details: { flex: 1, gap: 1 },
});
