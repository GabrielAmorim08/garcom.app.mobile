import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';

type BadgeTone = 'neutral' | 'gold' | 'success' | 'danger';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/** Small pill: distance on a card, a status, "1.2 km de você". */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const palette = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppText variant="overline" color={palette.text}>
        {label}
      </AppText>
    </View>
  );
}

const tones: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.surfaceAlt, text: colors.textSecondary },
  gold: { background: colors.primarySoft, text: colors.primaryPressed },
  success: { background: colors.successSoft, text: colors.success },
  danger: { background: colors.dangerSoft, text: colors.danger },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
