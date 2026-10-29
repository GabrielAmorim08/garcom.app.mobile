import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, shadows, spacing } from '../../theme';
import type { LocationBlock } from '../hooks/useLocationAccess';
import { AppText } from './AppText';
import { Button } from './Button';

interface LocationRequiredDialogProps {
  block: LocationBlock;
  onOpenSettings: () => void;
}

/**
 * Cannot be dismissed: the app is useless without a position, and the only way out
 * is the settings screen, which hands the user back here once location is on.
 */
export function LocationRequiredDialog({ block, onOpenSettings }: LocationRequiredDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={block !== null} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityViewIsModal>
          <AppText variant="subtitle" align="center">
            {t('location.requiredTitle')}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} align="center">
            {block === 'services' ? t('location.servicesOff') : t('location.permissionDenied')}
          </AppText>
          <Button label={t('location.openSettings')} onPress={onOpenSettings} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dialog: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.floating,
  },
});
