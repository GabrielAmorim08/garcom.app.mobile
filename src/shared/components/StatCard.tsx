import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface StatCardProps {
  value: string;
  label: string;
  /** Adds the gold star used by the rating tile. */
  withStar?: boolean;
}

/** The "12 / Serviços realizados" and "4.9 ★ / Avaliação média" tiles. */
export function StatCard({ value, label, withStar = false }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.valueRow}>
        <AppText variant="title" color={colors.primaryPressed}>
          {value}
        </AppText>
        {withStar ? <Icon name="star" size={16} color={colors.primary} filled /> : null}
      </View>
      <AppText variant="caption" color={colors.textMuted} align="center">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
