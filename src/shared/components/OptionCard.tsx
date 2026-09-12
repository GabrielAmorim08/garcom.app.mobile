import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../../theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { Icon, IconName } from './Icon';

interface OptionCardProps {
  icon: IconName;
  label: string;
  hint?: string;
  selected?: boolean;
  onPress: () => void;
}

/** The picker rows on step 1: round gold icon, label, one line of help text. */
export function OptionCard({ icon, label, hint, selected = false, onPress }: OptionCardProps) {
  return (
    <Card onPress={onPress} selected={selected} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Icon name={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.texts}>
          <AppText variant="bodyStrong">{label}</AppText>
          {hint ? (
            <AppText variant="caption" color={colors.textMuted}>
              {hint}
            </AppText>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
});
