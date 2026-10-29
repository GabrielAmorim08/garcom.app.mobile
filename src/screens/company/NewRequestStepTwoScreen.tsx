import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
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
  MapPreview,
  OptionCard,
  Screen,
  ScreenHeader,
  StepProgress,
} from '../../shared/components';
import { useCurrentLocation } from '../../shared/hooks/useCurrentLocation';
import { formatLongDate, formatTime } from '../../shared/utils/format';
import { colors, radius, spacing, typography } from '../../theme';

type AddressMode = 'location' | 'manual';
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
  latitude?: number | null;
  longitude?: number | null;
}

export function NewRequestStepTwoScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { isLocating, request } = useCurrentLocation();

  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const [addressMode, setAddressMode] = useState<AddressMode | null>(() =>
    useNewRequestStore.getState().address.street || useNewRequestStore.getState().address.postalCode
      ? 'manual'
      : null,
  );
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

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

  async function applyCurrentLocation() {
    setLocationMessage(null);
    const point = await request();

    if (!point) {
      setLocationMessage(t('serviceRequest.step2.locationFailed'));
      setAddress(address, null);
      return;
    }

    setIsResolvingAddress(true);
    try {
      const { data } = await httpClient.get<{
        street?: string | null;
        number?: string | null;
        district?: string | null;
        city?: string | null;
        state?: string | null;
        postalCode?: string | null;
      }>('/geocoding/reverse', { params: { latitude: point.latitude, longitude: point.longitude } });

      setAddress(
        {
          ...address,
          street: data.street ?? address.street,
          number: data.number ?? address.number,
          district: data.district ?? address.district,
          city: data.city ?? address.city,
          state: data.state ?? address.state,
          postalCode: data.postalCode ? maskPostalCode(data.postalCode) : address.postalCode,
          country: 'BR',
        },
        point,
      );
    } catch {
      // The position is still good: the company fills in the street by hand.
      setAddress(address, point);
      setLocationMessage(t('serviceRequest.step2.reverseNotFound'));
    } finally {
      setIsResolvingAddress(false);
    }
  }

  function chooseMode(mode: AddressMode) {
    setAddressMode(mode);
    if (mode === 'location') {
      applyCurrentLocation();
    }
  }

  function updateAddress(patch: Partial<typeof address>) {
    const venueChanged = 'postalCode' in patch || 'street' in patch || 'number' in patch || 'city' in patch || 'state' in patch;
    setAddress({ ...address, ...patch, country: 'BR' }, venueChanged ? null : location);
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
        // The CEP the company just searched is the place it means, so its position
        // replaces an earlier one (the GPS reading, for instance) instead of keeping it.
        data.latitude != null && data.longitude != null
          ? { latitude: data.latitude, longitude: data.longitude }
          : null,
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

          <OptionCard
            icon="navigate"
            label={t('serviceRequest.step2.modeLocation')}
            hint={t('serviceRequest.step2.modeLocationHint')}
            selected={addressMode === 'location'}
            onPress={() => chooseMode('location')}
          />
          <OptionCard
            icon="pin"
            label={t('serviceRequest.step2.modeManual')}
            hint={t('serviceRequest.step2.modeManualHint')}
            selected={addressMode === 'manual'}
            onPress={() => chooseMode('manual')}
          />

          {addressMode === 'location' ? (
            <View style={styles.locationStatus}>
              {isLocating || isResolvingAddress ? (
                <View style={styles.locationRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <AppText variant="caption" color={colors.textMuted}>
                    {t('serviceRequest.step2.locating')}
                  </AppText>
                </View>
              ) : (
                <Button
                  label={t('serviceRequest.step2.refreshLocation')}
                  variant="ghost"
                  size="md"
                  onPress={applyCurrentLocation}
                />
              )}
              {locationMessage ? (
                <AppText variant="caption" color={colors.textMuted}>
                  {locationMessage}
                </AppText>
              ) : null}
            </View>
          ) : null}

          {addressMode === 'manual' ? (
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

          ) : null}

          {addressMode !== null ? (
            <>
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
            </>
          ) : null}
        </View>

        {addressMode !== null ? <MapPreview location={location} height={140} /> : null}
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
      latitude?: number | null;
      longitude?: number | null;
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
  locationStatus: { gap: spacing.sm },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
