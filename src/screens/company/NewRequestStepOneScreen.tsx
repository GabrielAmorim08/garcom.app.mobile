import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import type { ProviderKind } from '../../entities/jobPost/types';
import { AppText, Button, OptionCard, Screen, ScreenHeader, StepProgress } from '../../shared/components';
import type { IconName } from '../../shared/components';
import { spacing } from '../../theme';

const PROVIDER_KINDS: Array<{ kind: ProviderKind; icon: IconName; key: string }> = [
  { kind: 'Waiter', icon: 'users', key: 'waiter' },
  { kind: 'KitchenAssistant', icon: 'utensils', key: 'kitchenAssistant' },
  { kind: 'PantryAttendant', icon: 'utensils', key: 'pantryAttendant' },
  { kind: 'Bartender', icon: 'party', key: 'bartender' },
  { kind: 'Receptionist', icon: 'user', key: 'receptionist' },
  { kind: 'Cleaner', icon: 'check', key: 'cleaner' },
  { kind: 'Other', icon: 'dots', key: 'other' },
];

export function NewRequestStepOneScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const providerKind = useNewRequestStore(state => state.providerKind);
  const setProviderKind = useNewRequestStore(state => state.setProviderKind);

  return (
    <Screen
      scrollable
      footer={
        <Button
          label={t('common.continue')}
          disabled={!providerKind}
          onPress={() => navigation.navigate('NewRequestStepTwo')}
        />
      }>
      <ScreenHeader title={t('serviceRequest.newRequest')} onBack={navigation.goBack} />
      <StepProgress current={1} total={3} />

      <View style={styles.content}>
        <AppText variant="subtitle">{t('serviceRequest.step1.providerQuestion')}</AppText>

        <View style={styles.options}>
          {PROVIDER_KINDS.map(({ kind, icon, key }) => (
            <OptionCard
              key={kind}
              icon={icon}
              label={t(`serviceRequest.step1.providers.${key}.label` as never)}
              hint={t(`serviceRequest.step1.providers.${key}.hint` as never)}
              selected={providerKind === kind}
              onPress={() => setProviderKind(kind)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  options: { gap: spacing.md },
});
