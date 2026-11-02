import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '../../theme';
import { AppText } from './AppText';

export interface DialogDetail {
  label: string;
  value: string;
}

interface DialogFrameProps {
  visible: boolean;
  title: string;
  message?: string;
  details?: DialogDetail[];
  onRequestClose: () => void;
  /** The buttons, laid out by the caller. */
  children: React.ReactNode;
}

/** The card and backdrop shared by the confirmation and notice dialogs. */
export function DialogFrame({
  visible,
  title,
  message,
  details,
  onRequestClose,
  children,
}: DialogFrameProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <AppText variant="subtitle" align="center">
            {title}
          </AppText>

          {message ? (
            <AppText variant="body" color={colors.textSecondary} align="center">
              {message}
            </AppText>
          ) : null}

          {details && details.length > 0 ? (
            <View style={styles.details}>
              {details.map(detail => (
                <View key={detail.label} style={styles.detailRow}>
                  <AppText variant="caption" color={colors.textMuted}>
                    {detail.label}
                  </AppText>
                  <AppText variant="bodyStrong">{detail.value}</AppText>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.actions}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.overlay,
  },
  dialog: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.floating,
  },
  details: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  detailRow: { gap: spacing.xxs },
  actions: { gap: spacing.sm },
});
