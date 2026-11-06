import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText, Icon } from '../../../shared/components';
import { colors, radius, spacing } from '../../../theme';
import { PROVIDER_KINDS, providerKindKey } from '../providerKinds';
import type { ProviderKind } from '../types';

interface ProviderKindPickerProps {
  value: ProviderKind[];
  onChange: (next: ProviderKind[]) => void;
}

/** Lets a provider mark every role they work as. More than one can be selected. */
export function ProviderKindPicker({ value, onChange }: ProviderKindPickerProps) {
  const { t } = useTranslation();

  function toggle(kind: ProviderKind) {
    onChange(value.includes(kind) ? value.filter(item => item !== kind) : [...value, kind]);
  }

  return (
    <View style={styles.wrap}>
      {PROVIDER_KINDS.map(kind => {
        const selected = value.includes(kind);

        return (
          <Pressable
            key={kind}
            onPress={() => toggle(kind)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            style={[styles.chip, selected && styles.chipSelected]}>
            {selected ? <Icon name="check" size={14} color={colors.onPrimary} /> : null}
            <AppText variant="captionStrong" color={selected ? colors.onPrimary : colors.textSecondary}>
              {t(`serviceRequest.step1.providers.${providerKindKey(kind)}.label` as never)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
