import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { PixKeyType } from '../../entities/user/types';
import {
  useSetAvailability,
  useUpdateWaiterProfile,
  useWaiterProfile,
} from '../../entities/user/useUser';
import { getErrorMessage } from '../../shared/api/errorMessage';
import {
  AppText,
  Button,
  Card,
  Screen,
  ScreenHeader,
  SegmentedControl,
  Stepper,
  TextArea,
  TextField,
} from '../../shared/components';
import { maskCpf, maskPhone, onlyDigits } from '../../shared/utils/masks';
import { colors, spacing } from '../../theme';

const PIX_TYPES: PixKeyType[] = ['Cpf', 'Phone', 'Email', 'Random'];

function pixTypeLabelKey(type: PixKeyType): string {
  return `waiter.profileEdit.pixTypes.${type.toLowerCase()}`;
}

function toDisplayPixKey(type: PixKeyType | null, key: string | null): string {
  if (!key) {
    return '';
  }

  if (type === 'Cpf') {
    return maskCpf(key);
  }

  if (type === 'Phone') {
    return maskPhone(key.replace(/^\+55/, ''));
  }

  return key;
}

function maskPixKey(type: PixKeyType, value: string): string {
  if (type === 'Cpf') {
    return maskCpf(value);
  }

  return type === 'Phone' ? maskPhone(value) : value;
}

function parseMoney(value: string): number | null {
  const normalised = value.replace(',', '.').trim();
  if (!normalised) {
    return null;
  }

  const parsed = Number(normalised);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function WaiterProfileEditScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const { data: profile } = useWaiterProfile();
  const { mutateAsync: saveProfile, isPending: isSaving } = useUpdateWaiterProfile();
  const { mutateAsync: changeAvailability, isPending: isTogglingAvailability } = useSetAvailability();

  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [radiusKm, setRadiusKm] = useState(10);
  const [hourlyRate, setHourlyRate] = useState('');
  const [pixType, setPixType] = useState<PixKeyType>('Cpf');
  const [pixKey, setPixKey] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setBio(profile.bio ?? '');
    setExperienceYears(profile.experienceYears);
    setRadiusKm(Math.round(profile.searchRadiusMeters / 1000));
    setHourlyRate(profile.hourlyRate === null ? '' : String(profile.hourlyRate));
    setPixType(profile.pixKeyType ?? 'Cpf');
    setPixKey(toDisplayPixKey(profile.pixKeyType, profile.pixKey));
  }, [profile]);

  function changePixType(type: PixKeyType) {
    setPixType(type);
    setPixKey('');
  }

  async function toggleAvailability(next: boolean) {
    try {
      await changeAvailability(next);
    } catch (error) {
      setMessage({ text: getErrorMessage(error, t), isError: true });
    }
  }

  async function save() {
    if (!profile) {
      return;
    }

    setMessage(null);

    const rawKey = pixType === 'Cpf' || pixType === 'Phone' ? onlyDigits(pixKey) : pixKey.trim();

    try {
      await saveProfile({
        bio: bio.trim() || null,
        experienceYears,
        hourlyRate: parseMoney(hourlyRate),
        searchRadiusMeters: radiusKm * 1000,
        homeAddress: profile.homeAddress,
        homeLocation: profile.homeLocation,
        pixKey: rawKey || null,
        pixKeyType: rawKey ? pixType : null,
      });
      setMessage({ text: t('waiter.profileEdit.saved'), isError: false });
    } catch (error) {
      setMessage({ text: getErrorMessage(error, t), isError: true });
    }
  }

  return (
    <Screen
      scrollable
      footer={
        <View style={styles.footer}>
          {message ? (
            <AppText
              variant="caption"
              align="center"
              color={message.isError ? colors.danger : colors.success}>
              {message.text}
            </AppText>
          ) : null}
          <Button label={t('waiter.profileEdit.save')} loading={isSaving} onPress={save} />
        </View>
      }>
      <ScreenHeader title={t('waiter.profileEdit.title')} onBack={navigation.goBack} />

      <View style={styles.content}>
        <Card style={styles.availability}>
          <View style={styles.availabilityTexts}>
            <AppText variant="bodyStrong">{t('waiter.profileEdit.availability')}</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t('waiter.profileEdit.availabilityHint')}
            </AppText>
          </View>
          <Switch
            value={profile?.isAvailable ?? true}
            disabled={!profile || isTogglingAvailability}
            onValueChange={toggleAvailability}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityLabel={t('waiter.profileEdit.availability')}
          />
        </Card>

        <TextArea
          label={t('waiter.profileEdit.bio')}
          value={bio}
          onChangeText={setBio}
          placeholder={t('waiter.profileEdit.bioPlaceholder')}
          maxLength={2000}
        />

        <View style={styles.stepperRow}>
          <AppText variant="bodyStrong" style={styles.stepperLabel}>
            {t('waiter.profileEdit.experienceYears')}
          </AppText>
          <Stepper value={experienceYears} onChange={setExperienceYears} min={0} max={60} />
        </View>

        <View style={styles.stepperRow}>
          <AppText variant="bodyStrong" style={styles.stepperLabel}>
            {t('waiter.profileEdit.searchRadius')}
          </AppText>
          <Stepper value={radiusKm} onChange={setRadiusKm} min={1} max={100} />
        </View>

        <TextField
          label={t('waiter.profileEdit.hourlyRate')}
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="decimal-pad"
          placeholder="0,00"
        />

        <Card style={styles.pix}>
          <AppText variant="bodyStrong">{t('waiter.profileEdit.pixTitle')}</AppText>
          <AppText variant="caption" color={profile?.canReceivePayouts ? colors.textMuted : colors.danger}>
            {profile?.canReceivePayouts ? t('waiter.profileEdit.pixHint') : t('waiter.profileEdit.pixMissing')}
          </AppText>

          <SegmentedControl<PixKeyType>
            value={pixType}
            onChange={changePixType}
            options={PIX_TYPES.map(type => ({
              value: type,
              label: t(pixTypeLabelKey(type) as never),
            }))}
          />

          <TextField
            label={t('waiter.profileEdit.pixKey')}
            value={pixKey}
            onChangeText={value => setPixKey(maskPixKey(pixType, value))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={
              pixType === 'Email' ? 'email-address' : pixType === 'Random' ? 'default' : 'number-pad'
            }
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  availability: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  availabilityTexts: { flex: 1, gap: spacing.xxs },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stepperLabel: { flex: 1 },
  pix: { gap: spacing.md },
  footer: { gap: spacing.sm },
});
