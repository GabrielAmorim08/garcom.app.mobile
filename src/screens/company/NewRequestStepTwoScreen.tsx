import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import {
  AppText,
  Button,
  FieldRow,
  Icon,
  MapPreview,
  Screen,
  ScreenHeader,
  StepProgress,
} from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { formatLongDate, formatTime } from '../../shared/utils/format';
import { colors, spacing } from '../../theme';

type OpenPicker = 'date' | 'start' | 'end' | null;

export function NewRequestStepTwoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isLocating, request } = useCurrentLocation();

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);

  const date = useNewRequestStore(state => state.date);
  const startTime = useNewRequestStore(state => state.startTime);
  const endTime = useNewRequestStore(state => state.endTime);
  const address = useNewRequestStore(state => state.address);
  const location = useNewRequestStore(state => state.location);
  const setDate = useNewRequestStore(state => state.setDate);
  const setTimeRange = useNewRequestStore(state => state.setTimeRange);
  const setAddress = useNewRequestStore(state => state.setAddress);
  const isStepTwoValid = useNewRequestStore(state => state.isStepTwoValid);

  function handlePicked(event: DateTimePickerEvent, value?: Date) {
    const picking = openPicker;
    setOpenPicker(null);

    if (event.type !== 'set' || !value || !picking) {
      return;
    }

    if (picking === 'date') {
      setDate(value);
      return;
    }

    if (picking === 'start') {
      setTimeRange(value, endTime ?? value);
      return;
    }

    setTimeRange(startTime ?? value, value);
  }

  async function useMyLocation() {
    const point = await request();
    if (point) {
      setAddress(address, point);
    }
  }

  const timeLabel =
    startTime && endTime
      ? t('serviceRequest.step2.timeRange', {
          start: formatTime(startTime.toISOString()),
          end: formatTime(endTime.toISOString()),
        })
      : null;

  const addressLabel = [address.street, address.number].filter(Boolean).join(', ') || null;

  return (
    <Screen
      scrollable
      footer={
        <Button
          label={t('common.continue')}
          disabled={!isStepTwoValid()}
          onPress={() => navigation.navigate('NewRequestStepThree')}
        />
      }>
      <ScreenHeader title={t('serviceRequest.newRequest')} onBack={navigation.goBack} />
      <StepProgress current={2} total={3} />

      <View style={styles.content}>
        <AppText variant="subtitle">{t('serviceRequest.step2.question')}</AppText>

        <FieldRow
          icon="calendar"
          label={t('serviceRequest.step2.date')}
          value={date ? formatLongDate(date.toISOString()) : null}
          placeholder={t('errors.invalidDate')}
          onPress={() => setOpenPicker('date')}
        />

        <View style={styles.timeRow}>
          <View style={styles.flex}>
            <FieldRow
              icon="clock"
              label={t('serviceRequest.step2.time')}
              value={timeLabel}
              placeholder="--:-- / --:--"
              onPress={() => setOpenPicker('start')}
            />
          </View>
        </View>

        {startTime ? (
          <Button
            label={t('serviceRequest.step2.time')}
            variant="ghost"
            size="md"
            onPress={() => setOpenPicker('end')}
          />
        ) : null}

        <FieldRow
          icon="pin"
          label={t('serviceRequest.step2.address')}
          value={addressLabel}
          placeholder={t('serviceRequest.step2.addressPlaceholder')}
        />

        <MapPreview location={location} height={120} />

        <Button
          label={t('serviceRequest.step2.useMyLocation')}
          variant="secondary"
          size="md"
          loading={isLocating}
          onPress={useMyLocation}
          icon={<Icon name="navigate" size={16} color={colors.primary} />}
        />
      </View>

      {openPicker ? (
        <DateTimePicker
          value={
            openPicker === 'date'
              ? date ?? new Date()
              : openPicker === 'start'
                ? startTime ?? new Date()
                : endTime ?? startTime ?? new Date()
          }
          mode={openPicker === 'date' ? 'date' : 'time'}
          is24Hour
          minimumDate={openPicker === 'date' ? new Date() : undefined}
          onChange={handlePicked}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  timeRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
