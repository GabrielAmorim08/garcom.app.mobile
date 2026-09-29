import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../entities/auth/authStore';
import { useMyCompany, useUpdateMyCompany } from '../../entities/company/useCompany';
import { useCurrentUser, useUpdateCurrentUser } from '../../entities/user/useUser';
import { AppText, Button, Card, Screen, ScreenHeader } from '../../shared/components';
import type { Address } from '../../shared/types/common';
import { maskCnpj, maskPhone, onlyDigits } from '../../shared/utils/masks';
import { colors, radius, spacing, typography } from '../../theme';

export function ProfileDetailsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const mode = useAuthStore(state => state.mode);
  const setUser = useAuthStore(state => state.setUser);

  const { data: user } = useCurrentUser();
  const { data: company } = useMyCompany(mode === 'company');
  const { mutateAsync: updateUser, isPending: isSavingUser } = useUpdateCurrentUser();
  const { mutateAsync: updateCompany, isPending: isSavingCompany } = useUpdateMyCompany();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [address, setAddress] = useState<Address>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.fullName);
    setPhone(maskPhone(user.phone));
  }, [user]);

  useEffect(() => {
    if (!company) {
      return;
    }

    setLegalName(company.legalName);
    setTradeName(company.tradeName ?? '');
    setTaxId(maskCnpj(company.taxId));
    setCompanyEmail(company.email);
    setCompanyPhone(maskPhone(company.phone));
    setAddress(company.address ?? {});
  }, [company]);

  function updateAddress(patch: Partial<Address>) {
    setAddress(current => ({ ...current, ...patch, country: 'BR' }));
  }

  async function save() {
    if (!fullName.trim() || !phone.trim()) {
      return;
    }

    const updatedUser = await updateUser({
      fullName: fullName.trim(),
      phone: onlyDigits(phone),
    });
    setUser(updatedUser);

    if (mode === 'company' && company) {
      await updateCompany({
        legalName: legalName.trim(),
        tradeName: tradeName.trim() || null,
        taxId: onlyDigits(taxId),
        email: companyEmail.trim(),
        phone: onlyDigits(companyPhone),
        address,
      });
    }

    setSaved(true);
  }

  const isSaving = isSavingUser || isSavingCompany;

  return (
    <Screen
      scrollable
      footer={
        <Button
          label={t('common.save')}
          loading={isSaving}
          disabled={!fullName.trim() || !phone.trim()}
          onPress={save}
        />
      }>
      <ScreenHeader title={t('profile.registrationData')} onBack={navigation.goBack} />

      <View style={styles.content}>
        <Card style={styles.section}>
          <AppText variant="subtitle">{t('profile.personalData')}</AppText>
          <Field label={t('auth.fullName')} value={fullName} onChangeText={setFullName} />
          <Field
            label={t('auth.phone')}
            value={phone}
            onChangeText={value => setPhone(maskPhone(value))}
            keyboardType="phone-pad"
          />
          <Field label={t('auth.email')} value={user?.email ?? ''} onChangeText={() => {}} editable={false} />
        </Card>

        {mode === 'company' ? (
          <Card style={styles.section}>
            <AppText variant="subtitle">{t('profile.companyData')}</AppText>
            <Field label={t('auth.companyLegalName')} value={legalName} onChangeText={setLegalName} />
            <Field label={t('auth.companyTradeName')} value={tradeName} onChangeText={setTradeName} />
            <Field
              label={t('auth.companyTaxId')}
              value={taxId}
              onChangeText={value => setTaxId(maskCnpj(value))}
              keyboardType="number-pad"
            />
            <Field
              label={t('auth.companyEmail')}
              value={companyEmail}
              onChangeText={setCompanyEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label={t('auth.companyPhone')}
              value={companyPhone}
              onChangeText={value => setCompanyPhone(maskPhone(value))}
              keyboardType="phone-pad"
            />

            <View style={styles.divider} />
            <AppText variant="bodyStrong">{t('profile.companyAddress')}</AppText>
            <Field
              label={t('serviceRequest.step2.postalCode')}
              value={address.postalCode ?? ''}
              onChangeText={value => updateAddress({ postalCode: value })}
              keyboardType="number-pad"
            />
            <Field
              label={t('serviceRequest.step2.street')}
              value={address.street ?? ''}
              onChangeText={value => updateAddress({ street: value })}
            />
            <View style={styles.row}>
              <View style={styles.numberField}>
                <Field
                  label={t('serviceRequest.step2.number')}
                  value={address.number ?? ''}
                  onChangeText={value => updateAddress({ number: value })}
                />
              </View>
              <View style={styles.flex}>
                <Field
                  label={t('serviceRequest.step2.complement')}
                  value={address.complement ?? ''}
                  onChangeText={value => updateAddress({ complement: value })}
                />
              </View>
            </View>
            <Field
              label={t('serviceRequest.step2.district')}
              value={address.district ?? ''}
              onChangeText={value => updateAddress({ district: value })}
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <Field
                  label={t('serviceRequest.step2.city')}
                  value={address.city ?? ''}
                  onChangeText={value => updateAddress({ city: value })}
                />
              </View>
              <View style={styles.stateField}>
                <Field
                  label={t('serviceRequest.step2.state')}
                  value={address.state ?? ''}
                  onChangeText={value => updateAddress({ state: value.toUpperCase().slice(0, 2) })}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
            </View>
          </Card>
        ) : null}

        {saved ? (
          <AppText variant="captionStrong" color={colors.success} align="center">
            {t('profile.saved')}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  maxLength?: number;
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="captionStrong" color={colors.textSecondary}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !editable ? styles.inputDisabled : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: { gap: spacing.md },
  field: { gap: spacing.sm },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  inputDisabled: { backgroundColor: colors.surfaceAlt, color: colors.textMuted },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  numberField: { width: 96 },
  stateField: { width: 76 },
});
