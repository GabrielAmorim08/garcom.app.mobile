import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import { useCreateJobPost, useJobPostEstimate } from '../../entities/jobPost/useJobPosts';
import {
  AppText,
  Button,
  Card,
  ConfirmDialog,
  Screen,
  ScreenHeader,
  StepProgress,
  Stepper,
  TextArea,
} from '../../shared/components';
import { formatCurrency, formatLongDate, formatTime, formatTimeRange } from '../../shared/utils/format';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { colors, radius, spacing, typography } from '../../theme';

export function NewRequestStepThreeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const providerKind = useNewRequestStore(state => state.providerKind);
  const slots = useNewRequestStore(state => state.slots);
  const payAmount = useNewRequestStore(state => state.payAmount);
  const address = useNewRequestStore(state => state.address);
  const notes = useNewRequestStore(state => state.notes);
  const setSlots = useNewRequestStore(state => state.setSlots);
  const setPayAmount = useNewRequestStore(state => state.setPayAmount);
  const setNotes = useNewRequestStore(state => state.setNotes);
  const getShiftRange = useNewRequestStore(state => state.getShiftRange);
  const toRequest = useNewRequestStore(state => state.toRequest);
  const reset = useNewRequestStore(state => state.reset);

  const range = getShiftRange();
  const estimateInput =
    providerKind && range ? { serviceKind: 'Other' as const, providerKind, slots, ...range } : null;

  const { data: estimate, isLoading: isEstimating } = useJobPostEstimate(estimateInput);
  const { mutateAsync: createJobPost, isPending } = useCreateJobPost();
  const [payAmountText, setPayAmountText] = useState(payAmount ? toCurrencyInput(payAmount) : '');
  const [submitError, setSubmitError] = useState<string | null>(null);
  // The suggested value is filled in once. Without this, clearing the field puts it back.
  const suggestionApplied = useRef(payAmount !== null);
  const [confirming, setConfirming] = useState(false);

  const title = providerKind
    ? t(`serviceRequest.step1.providers.${providerKindKey(providerKind)}.label` as never)
    : '';

  useEffect(() => {
    if (!estimate || suggestionApplied.current || payAmount !== null) {
      return;
    }

    suggestionApplied.current = true;
    setPayAmount(estimate.maxAmount);
    setPayAmountText(toCurrencyInput(estimate.maxAmount));
  }, [estimate, payAmount, setPayAmount]);

  function changePayAmount(value: string) {
    suggestionApplied.current = true;
    setPayAmountText(value);
    setPayAmount(parseCurrencyInput(value));
  }

  function requestDetails() {
    if (!range || !payAmount) {
      return [];
    }

    const sameDay = new Date(range.shiftStart).toDateString() === new Date(range.shiftEnd).toDateString();
    const when = sameDay
      ? `${formatLongDate(range.shiftStart)} · ${formatTimeRange(range.shiftStart, range.shiftEnd)}`
      : `${formatLongDate(range.shiftStart)} ${formatTime(range.shiftStart)} → ${formatLongDate(range.shiftEnd)} ${formatTime(range.shiftEnd)}`;
    const where = [
      [address.street, address.number].filter(Boolean).join(', '),
      address.district,
      [address.city, address.state].filter(Boolean).join(' - '),
    ]
      .filter(Boolean)
      .join(' · ');

    return [
      { label: t('dialogs.request.service'), value: `${slots} × ${title}` },
      { label: t('dialogs.request.when'), value: when },
      { label: t('dialogs.request.where'), value: where },
      { label: t('dialogs.request.payPerPerson'), value: formatCurrency(payAmount) },
      { label: t('dialogs.request.total'), value: formatCurrency(payAmount * slots) },
    ];
  }

  async function submit() {
    setConfirming(false);
    setSubmitError(null);
    const payload = toRequest(title);
    if (!payload) {
      return;
    }

    try {
      const created = await createJobPost(payload);
      reset();
      navigation.reset({
        index: 0,
        routes: [{ name: 'CompanyTabs' }, { name: 'RequestSent', params: { jobPostId: created.id } }],
      });
    } catch (error) {
      setSubmitError(getErrorMessage(error, t));
    }
  }

  return (
    <Screen
      scrollable
      footer={
        <View style={styles.submitFooter}>
          {submitError ? <AppText variant="caption" color={colors.danger}>{submitError}</AppText> : null}
          <Button
            label={t('serviceRequest.step3.submit')}
            loading={isPending}
            disabled={!estimateInput || !payAmount || payAmount <= 0}
            onPress={() => setConfirming(true)}
          />
        </View>
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

        <View style={styles.inputGroup}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('serviceRequest.step3.payPerProvider')}
          </AppText>
          <TextInput
            value={payAmountText}
            onChangeText={changePayAmount}
            placeholder="0,00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel={t('serviceRequest.step3.payPerProvider')}
          />
          <AppText variant="caption" color={colors.textMuted}>
            {t('serviceRequest.step3.payPerProviderHint')}
          </AppText>
        </View>
      </View>

      <ConfirmDialog
        visible={confirming}
        title={t('dialogs.request.title')}
        message={t('dialogs.request.message')}
        details={requestDetails()}
        confirmLabel={t('dialogs.request.confirm')}
        onConfirm={() => void submit()}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

function parseCurrencyInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function toCurrencyInput(value: number) {
  return value.toFixed(2).replace('.', ',');
}

function providerKindKey(kind: string): string {
  switch (kind) {
    case 'Waiter':
      return 'waiter';
    case 'KitchenAssistant':
      return 'kitchenAssistant';
    case 'PantryAttendant':
      return 'pantryAttendant';
    case 'Bartender':
      return 'bartender';
    case 'Receptionist':
      return 'receptionist';
    case 'Cleaner':
      return 'cleaner';
    default:
      return 'other';
  }
}

const styles = StyleSheet.create({
  submitFooter: { gap: spacing.sm },
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  quantityBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  estimate: { gap: spacing.xs },
  inputGroup: { gap: spacing.sm },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
