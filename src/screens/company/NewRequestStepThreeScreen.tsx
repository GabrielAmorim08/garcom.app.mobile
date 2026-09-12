import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import { useCreateJobPost, useJobPostEstimate } from '../../entities/jobPost/useJobPosts';
import {
  AppText,
  Button,
  Card,
  Screen,
  ScreenHeader,
  StepProgress,
  Stepper,
  TextArea,
} from '../../shared/components';
import { formatCurrency } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

export function NewRequestStepThreeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const serviceKind = useNewRequestStore(state => state.serviceKind);
  const slots = useNewRequestStore(state => state.slots);
  const notes = useNewRequestStore(state => state.notes);
  const setSlots = useNewRequestStore(state => state.setSlots);
  const setNotes = useNewRequestStore(state => state.setNotes);
  const getShiftRange = useNewRequestStore(state => state.getShiftRange);
  const toRequest = useNewRequestStore(state => state.toRequest);
  const reset = useNewRequestStore(state => state.reset);

  const range = getShiftRange();
  const estimateInput =
    serviceKind && range ? { serviceKind, slots, ...range } : null;

  const { data: estimate, isLoading: isEstimating } = useJobPostEstimate(estimateInput);
  const { mutateAsync: createJobPost, isPending } = useCreateJobPost();

  const title = serviceKind
    ? t(`serviceRequest.step1.types.${serviceKindKey(serviceKind)}.label` as never)
    : '';

  async function submit() {
    const payload = toRequest(title);
    if (!payload) {
      return;
    }

    const created = await createJobPost(payload);
    reset();
    navigation.reset({
      index: 0,
      routes: [{ name: 'CompanyTabs' }, { name: 'RequestSent', params: { jobPostId: created.id } }],
    });
  }

  return (
    <Screen
      scrollable
      footer={
        <Button
          label={t('serviceRequest.step3.submit')}
          loading={isPending}
          disabled={!estimateInput}
          onPress={submit}
        />
      }>
      <ScreenHeader title={t('serviceRequest.newRequest')} onBack={navigation.goBack} />
      <StepProgress current={3} total={3} />

      <View style={styles.content}>
        <AppText variant="subtitle">{t('serviceRequest.step3.title')}</AppText>

        <View style={styles.quantityBlock}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('serviceRequest.step3.waiterQuantity')}
          </AppText>
          <Stepper
            value={slots}
            onChange={setSlots}
            min={1}
            max={50}
            accessibilityLabel={t('serviceRequest.step3.waiterQuantity')}
          />
        </View>

        <TextArea
          label={`${t('serviceRequest.step3.notes')} (${t('common.optional')})`}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('serviceRequest.step3.notesPlaceholder')}
        />

        <Card style={styles.estimate}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('serviceRequest.step3.estimatedValue')}
          </AppText>

          <AppText variant="price" color={colors.textPrimary}>
            {isEstimating || !estimate
              ? t('common.loading')
              : t('serviceRequest.step3.estimatedRange', {
                  min: formatCurrency(estimate.minAmount, estimate.currency),
                  max: formatCurrency(estimate.maxAmount, estimate.currency),
                })}
          </AppText>

          <AppText variant="caption" color={colors.textMuted}>
            {t('serviceRequest.step3.estimateDisclaimer')}
          </AppText>
        </Card>
      </View>
    </Screen>
  );
}

function serviceKindKey(kind: string): string {
  switch (kind) {
    case 'PrivateEvent':
      return 'privateEvent';
    case 'Restaurant':
      return 'restaurant';
    case 'Corporate':
      return 'corporate';
    default:
      return 'other';
  }
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  quantityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  estimate: { gap: spacing.xs },
});
