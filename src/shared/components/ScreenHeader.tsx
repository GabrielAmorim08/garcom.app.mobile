import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, hitSlop, spacing } from '../../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  /** Rendered on the right: a filter button, an avatar, a counter. */
  right?: React.ReactNode;
  tone?: 'light' | 'dark';
}

/** The "< Nova solicitação" bar: back on the left, centred title, optional action. */
export function ScreenHeader({ title, onBack, right, tone = 'light' }: ScreenHeaderProps) {
  const foreground = tone === 'dark' ? colors.textOnDark : colors.textPrimary;

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel="voltar">
            <Icon name="chevronLeft" size={24} color={foreground} />
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <AppText variant="bodyStrong" color={foreground} align="center" style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={styles.title} />
      )}

      <View style={[styles.side, right ? styles.rightWithContent : styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  side: { width: 40, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  rightWithContent: { width: 'auto', minWidth: 40, alignItems: 'flex-end' },
  title: { flex: 1 },
});
