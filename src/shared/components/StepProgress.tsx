import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';

interface StepProgressProps {
  current: number;
  total: number;
}

/** Gold progress bar with the "1 de 3" counter beside it. */
export function StepProgress({ current, total }: StepProgressProps) {
  const { t } = useTranslation();
  const ratio = Math.min(Math.max(current / total, 0), 1);

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}>
        <View style={[styles.fill, { flex: ratio }]} />
        <View style={{ flex: 1 - ratio }} />
      </View>
      <AppText variant="caption" color={colors.textMuted}>
        {t('common.stepOf', { current, total })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { backgroundColor: colors.primary, borderRadius: radius.pill },
});
