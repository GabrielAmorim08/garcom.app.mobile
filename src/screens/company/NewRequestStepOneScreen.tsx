import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import type { ServiceKind } from '../../entities/jobPost/types';
import { AppText, Button, OptionCard, Screen, ScreenHeader, StepProgress } from '../../shared/components';
import type { IconName } from '../../shared/components';
import { spacing } from '../../theme';

const SERVICE_KINDS: Array<{ kind: ServiceKind; icon: IconName; key: string }> = [
  { kind: 'PrivateEvent', icon: 'party', key: 'privateEvent' },
  { kind: 'Restaurant', icon: 'utensils', key: 'restaurant' },
  { kind: 'Corporate', icon: 'building', key: 'corporate' },
  { kind: 'Other', icon: 'dots', key: 'other' },
];

export function NewRequestStepOneScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const serviceKind = useNewRequestStore(state => state.serviceKind);
  const setServiceKind = useNewRequestStore(state => state.setServiceKind);

  return (
    <Screen
      scrollable
      footer={
        <Button
          label={t('common.continue')}
          disabled={!serviceKind}
          onPress={() => navigation.navigate('NewRequestStepTwo')}
        />
      }>
      <ScreenHeader title={t('serviceRequest.newRequest')} onBack={navigation.goBack} />
      <StepProgress current={1} total={3} />

      <View style={styles.content}>
        <AppText variant="subtitle">{t('serviceRequest.step1.question')}</AppText>

        <View style={styles.options}>
          {SERVICE_KINDS.map(({ kind, icon, key }) => (
            <OptionCard
              key={kind}
              icon={icon}
              label={t(`serviceRequest.step1.types.${key}.label` as never)}
              hint={t(`serviceRequest.step1.types.${key}.hint` as never)}
              selected={serviceKind === kind}
              onPress={() => setServiceKind(kind)}
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
