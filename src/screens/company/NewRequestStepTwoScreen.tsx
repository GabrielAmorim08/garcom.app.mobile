import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { useNewRequestStore } from '../../entities/jobPost/newRequestStore';
import { httpClient } from '../../shared/api/httpClient';
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
import { colors, radius, spacing, typography } from '../../theme';

type OpenPicker = 'startDate' | 'startTime' | 'endDate' | 'endTime' | null;

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface BrasilApiCepResponse {
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

interface PostalCodeLookupResult {
  postalCode: string;
  street?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
}

export function NewRequestStepTwoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isLocating, request } = useCurrentLocation();

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const startDate = useNewRequestStore(state => state.startDate);
  const endDate = useNewRequestStore(state => state.endDate);
  const startTime = useNewRequestStore(state => state.startTime);
  const endTime = useNewRequestStore(state => state.endTime);
  const address = useNewRequestStore(state => state.address);
  const location = useNewRequestStore(state => state.location);
  const setStartDate = useNewRequestStore(state => state.setStartDate);
  const setEndDate = useNewRequestStore(state => state.setEndDate);
  const setStartTime = useNewRequestStore(state => state.setStartTime);
  const setEndTime = useNewRequestStore(state => state.setEndTime);
  const setAddress = useNewRequestStore(state => state.setAddress);
  const isStepTwoValid = useNewRequestStore(state => state.isStepTwoValid);

  function handlePicked(event: DateTimePickerEvent, value?: Date) {
    const picking = openPicker;
    setOpenPicker(null);

    if (event.type !== 'set' || !value || !picking) {
      return;
    }

    if (picking === 'startDate') {
      setStartDate(value);
      return;
    }

    if (picking === 'endDate') {
      setEndDate(value);
      return;
    }

    if (picking === 'startTime') {
      setStartTime(value);
      return;
    }

    setEndTime(value);
  }

  async function useMyLocation() {
    const point = await request();
    if (point) {
      setAddress(address, point);
    }
  }

  function updateAddress(patch: Partial<typeof address>) {
    setAddress({ ...address, ...patch, country: 'BR' }, location);
  }

  async function searchPostalCode() {
    const digits = onlyDigits(address.postalCode);
    if (digits.length !== 8) {
      setCepError(t('serviceRequest.step2.postalCodeInvalid'));
      return;
    }

    setIsSearchingCep(true);
    setCepError(null);

    try {
      const data = await lookupPostalCode(digits);

      if (!data) {
        setCepError(t('serviceRequest.step2.postalCodeNotFound'));
        return;
      }

      setAddress(
        {
          ...address,
          postalCode: maskPostalCode(data.postalCode),
          street: data.street ?? address.street,
          complement: address.complement ?? data.complement ?? null,
          district: data.district ?? address.district,
          city: data.city ?? address.city,
          state: data.state ?? address.state,
          country: 'BR',
        },
        location,
      );
    } catch {
      setCepError(t('serviceRequest.step2.postalCodeLookupFailed'));
    } finally {
      setIsSearchingCep(false);
    }
  }

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

        <View style={styles.dateTimeGrid}>
          <View style={styles.flex}>
            <FieldRow
              icon="calendar"
              label={t('serviceRequest.step2.startDate')}
              value={startDate ? formatLongDate(startDate.toISOString()) : null}
              placeholder={t('errors.invalidDate')}
              onPress={() => setOpenPicker('startDate')}
            />
          </View>
          <View style={styles.timeField}>
            <FieldRow
              icon="clock"
              label={t('serviceRequest.step2.startTime')}
              value={startTime ? formatTime(startTime.toISOString()) : null}
              placeholder="--:--"
              onPress={() => setOpenPicker('startTime')}
            />
          </View>
        </View>

        <View style={styles.dateTimeGrid}>
          <View style={styles.flex}>
            <FieldRow
              icon="calendar"
              label={t('serviceRequest.step2.endDate')}
              value={endDate ? formatLongDate(endDate.toISOString()) : null}
              placeholder={t('errors.invalidDate')}
              onPress={() => setOpenPicker('endDate')}
            />
          </View>
          <View style={styles.timeField}>
            <FieldRow
              icon="clock"
              label={t('serviceRequest.step2.endTime')}
              value={endTime ? formatTime(endTime.toISOString()) : null}
              placeholder="--:--"
              onPress={() => setOpenPicker('endTime')}
            />
          </View>
        </View>

        <View style={styles.addressBlock}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('serviceRequest.step2.address')}
          </AppText>

          <View style={styles.postalCodeRow}>
            <View style={styles.flex}>
              <AddressInput
                label={t('serviceRequest.step2.postalCode')}
                value={address.postalCode ?? ''}
                onChangeText={value => updateAddress({ postalCode: maskPostalCode(value) })}
                onEndEditing={searchPostalCode}
                placeholder="00000-000"
                keyboardType="number-pad"
                error={cepError}
              />
            </View>
            <Button
              label={t('serviceRequest.step2.searchPostalCode')}
              variant="secondary"
              size="md"
              loading={isSearchingCep}
              onPress={searchPostalCode}
            />
          </View>

          <AddressInput
            label={t('serviceRequest.step2.street')}
            value={address.street ?? ''}
            onChangeText={value => updateAddress({ street: value })}
            placeholder={t('serviceRequest.step2.streetPlaceholder')}
          />

          <View style={styles.addressRow}>
            <View style={styles.numberField}>
              <AddressInput
                label={t('serviceRequest.step2.number')}
                value={address.number ?? ''}
                onChangeText={value => updateAddress({ number: value })}
                placeholder="123"
              />
            </View>
            <View style={styles.flex}>
              <AddressInput
                label={`${t('serviceRequest.step2.complement')} (${t('common.optional')})`}
                value={address.complement ?? ''}
                onChangeText={value => updateAddress({ complement: value })}
                placeholder={t('serviceRequest.step2.complementPlaceholder')}
              />
            </View>
          </View>

          <AddressInput
            label={t('serviceRequest.step2.district')}
            value={address.district ?? ''}
            onChangeText={value => updateAddress({ district: value })}
            placeholder={t('serviceRequest.step2.districtPlaceholder')}
          />

          <View style={styles.addressRow}>
            <View style={styles.flex}>
              <AddressInput
                label={t('serviceRequest.step2.city')}
                value={address.city ?? ''}
                onChangeText={value => updateAddress({ city: value })}
                placeholder={t('serviceRequest.step2.cityPlaceholder')}
              />
            </View>
            <View style={styles.stateField}>
              <AddressInput
                label={t('serviceRequest.step2.state')}
                value={address.state ?? ''}
                onChangeText={value => updateAddress({ state: value.toUpperCase().slice(0, 2) })}
                placeholder="SP"
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>
        </View>

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
            openPicker === 'startDate'
              ? startDate ?? new Date()
              : openPicker === 'endDate'
                ? endDate ?? startDate ?? new Date()
                : openPicker === 'startTime'
                ? startTime ?? new Date()
                : endTime ?? startTime ?? new Date()
          }
          mode={openPicker === 'startDate' || openPicker === 'endDate' ? 'date' : 'time'}
          is24Hour
          minimumDate={
            openPicker === 'startDate'
              ? new Date()
              : openPicker === 'endDate'
                ? startDate ?? new Date()
                : undefined
          }
          onChange={handlePicked}
        />
      ) : null}
    </Screen>
  );
}

interface AddressInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  error?: string | null;
  onEndEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}

function AddressInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  onEndEditing,
  autoCapitalize = 'sentences',
  maxLength,
}: AddressInputProps) {
  return (
    <View style={styles.inputGroup}>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={[styles.input, error ? styles.inputError : null]}
        accessibilityLabel={label}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function onlyDigits(value?: string | null) {
  return (value ?? '').replace(/\D/g, '');
}

function maskPostalCode(value?: string | null) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

async function lookupPostalCode(digits: string): Promise<PostalCodeLookupResult | null> {
  const api = await tryLookupApi(digits);
  if (api) {
    return api;
  }

  const viaCep = await tryLookupViaCep(digits);
  if (viaCep) {
    return viaCep;
  }

  return tryLookupBrasilApi(digits);
}

async function tryLookupApi(digits: string): Promise<PostalCodeLookupResult | null> {
  try {
    const { data } = await httpClient.get<{
      postalCode: string;
      street?: string | null;
      complement?: string | null;
      district?: string | null;
      city?: string | null;
      state?: string | null;
    }>(`/postal-codes/${digits}`);

    return data;
  } catch {
    return null;
  }
}

async function tryLookupViaCep(digits: string): Promise<PostalCodeLookupResult | null> {
  try {
    const { data } = await axios.get<ViaCepResponse>(
      `https://viacep.com.br/ws/${digits}/json/`,
      { timeout: 8000 },
    );

    if (data.erro) {
      return null;
    }

    return {
      postalCode: data.cep ?? digits,
      street: data.logradouro,
      complement: data.complemento,
      district: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  } catch {
    return null;
  }
}

async function tryLookupBrasilApi(digits: string): Promise<PostalCodeLookupResult | null> {
  try {
    const { data } = await axios.get<BrasilApiCepResponse>(
      `https://brasilapi.com.br/api/cep/v1/${digits}`,
      { timeout: 8000 },
    );

    return {
      postalCode: data.cep ?? digits,
      street: data.street,
      district: data.neighborhood,
      city: data.city,
      state: data.state,
    };
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
  dateTimeGrid: { flexDirection: 'row', gap: spacing.md },
  timeField: { width: 132 },
  flex: { flex: 1 },
  addressBlock: { gap: spacing.md },
  postalCodeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  addressRow: { flexDirection: 'row', gap: spacing.md },
  numberField: { width: 96 },
  stateField: { width: 76 },
  inputGroup: { gap: spacing.xs },
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
  inputError: { borderColor: colors.danger },
});
