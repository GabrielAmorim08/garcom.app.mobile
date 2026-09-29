import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { getDeviceInfo } from '../../entities/auth/deviceInfo';
import { useAuthStore } from '../../entities/auth/authStore';
import type { RootStackParamList } from '../../navigation/types';
import { ApiError } from '../../shared/api/apiError';
import { AppText, Button, Screen, SegmentedControl } from '../../shared/components';
import { maskCnpj, maskPhone, onlyDigits } from '../../shared/utils/masks';
import { colors, radius, spacing, typography } from '../../theme';

type SignUpRoute = RouteProp<RootStackParamList, 'SignUp'>;
type SignUpRole = 'Waiter' | 'CompanyOwner';

export function SignUpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<SignUpRoute>();
  const signUp = useAuthStore(state => state.signUp);
  const isSigningUp = useAuthStore(state => state.isSigningUp);

  const initialRole = route.params?.role ?? 'Waiter';
  const [role, setRole] = useState<SignUpRole>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [companyTradeName, setCompanyTradeName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => [
      { value: 'Waiter' as const, label: t('auth.iAmAWaiter') },
      { value: 'CompanyOwner' as const, label: t('auth.iAmACompany') },
    ],
    [t],
  );

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setError(t('errors.required'));
      return;
    }

    if (
      role === 'CompanyOwner'
      && (!companyLegalName.trim()
        || !companyTaxId.trim()
        || !companyEmail.trim()
        || !companyPhone.trim())
    ) {
      setError(t('errors.required'));
      return;
    }

    if (role === 'CompanyOwner' && onlyDigits(companyTaxId).length !== 14) {
      setError(t('auth.companyTaxIdInvalid'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordMin'));
      return;
    }

    setError(null);
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        device: await getDeviceInfo(),
        company: role === 'CompanyOwner'
          ? {
              legalName: companyLegalName.trim(),
              tradeName: companyTradeName.trim() || undefined,
              taxId: onlyDigits(companyTaxId),
              companyEmail: companyEmail.trim(),
              companyPhone: onlyDigits(companyPhone),
              address: {},
            }
          : undefined,
      });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('errors.generic'));
    }
  }

  return (
    <Screen scrollable edges={['top', 'bottom']} contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title" align="center">
          {t('auth.signUpTitle')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t('auth.signUpSubtitle')}
        </AppText>
      </View>

      <View style={styles.form}>
        <SegmentedControl options={roleOptions} value={role} onChange={setRole} />

        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.fullName')}
          </AppText>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            textContentType="name"
            placeholder={t('auth.fullNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.email')}
          </AppText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="voce@email.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.phone')}
          </AppText>
          <TextInput
            value={phone}
            onChangeText={value => setPhone(maskPhone(value))}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        {role === 'CompanyOwner' ? (
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <AppText variant="subtitle">{t('auth.companySectionTitle')}</AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {t('auth.companySectionSubtitle')}
              </AppText>
            </View>

            <View style={styles.field}>
              <AppText variant="captionStrong" color={colors.textSecondary}>
                {t('auth.companyLegalName')}
              </AppText>
              <TextInput
                value={companyLegalName}
                onChangeText={setCompanyLegalName}
                placeholder={t('auth.companyLegalNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="captionStrong" color={colors.textSecondary}>
                {t('auth.companyTradeName')}
              </AppText>
              <TextInput
                value={companyTradeName}
                onChangeText={setCompanyTradeName}
                placeholder={t('auth.companyTradeNamePlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="captionStrong" color={colors.textSecondary}>
                {t('auth.companyTaxId')}
              </AppText>
              <TextInput
                value={companyTaxId}
                onChangeText={value => setCompanyTaxId(maskCnpj(value))}
                keyboardType="number-pad"
                placeholder="00.000.000/0000-00"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="captionStrong" color={colors.textSecondary}>
                {t('auth.companyEmail')}
              </AppText>
              <TextInput
                value={companyEmail}
                onChangeText={setCompanyEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholder="empresa@email.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="captionStrong" color={colors.textSecondary}>
                {t('auth.companyPhone')}
              </AppText>
              <TextInput
                value={companyPhone}
                onChangeText={value => setCompanyPhone(maskPhone(value))}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                placeholder="(11) 99999-9999"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.field}>
          <AppText variant="captionStrong" color={colors.textSecondary}>
            {t('auth.password')}
          </AppText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            placeholder="********"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        {error ? (
          <View style={styles.error}>
            <AppText variant="captionStrong" color={colors.danger}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label={t('auth.createAccount')} onPress={handleSubmit} loading={isSigningUp} />

        <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.link}>
          <AppText variant="bodyStrong" color={colors.primary}>
            {t('auth.hasAccount')}
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
    gap: spacing.xxxl,
  },
  header: {
    gap: spacing.md,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    ...typography.body,
  },
  error: {
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
