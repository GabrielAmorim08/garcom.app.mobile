import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { authService } from '../../entities/auth/authService';
import { lookupCnpj } from '../../entities/company/cnpjLookup';
import type { Address } from '../../shared/types/common';
import { getDeviceInfo } from '../../entities/auth/deviceInfo';
import { useAuthStore } from '../../entities/auth/authStore';
import type { RootStackParamList } from '../../navigation/types';
import { ApiError } from '../../shared/api/apiError';
import { getErrorMessage } from '../../shared/api/errorMessage';
import {
  AppText,
  Button,
  CodeInput,
  Icon,
  OptionCard,
  PasswordField,
  Screen,
  ScreenHeader,
  StepProgress,
  TextField,
} from '../../shared/components';
import { isValidCnpj, isValidCpf } from '../../shared/utils/documents';
import {
  maskCnpj,
  maskCpf,
  maskPhone,
  onlyDigits,
} from '../../shared/utils/masks';
import { colors, spacing } from '../../theme';

type SignUpRoute = RouteProp<RootStackParamList, 'SignUp'>;
type SignUpRole = 'Waiter' | 'CompanyOwner';
type StepId =
  | 'profile'
  | 'personal'
  | 'company'
  | 'contact'
  | 'companyContact'
  | 'responsible'
  | 'code'
  | 'password';

const PROVIDER_STEPS: StepId[] = ['profile', 'personal', 'contact', 'code', 'password'];
const COMPANY_STEPS: StepId[] = [
  'profile',
  'company',
  'companyContact',
  'responsible',
  'code',
  'password',
];

const MIN_PASSWORD_LENGTH = 8;
const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function isEmail(value: string): boolean {
  return value.trim().includes('@');
}

/**
 * Account creation as a walk through short steps, one question group at a time. The
 * list of steps depends on the profile picked first: a provider signs up with a CPF,
 * a company with its CNPJ and a person responsible for the account.
 */
export function SignUpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<SignUpRoute>();
  const signUp = useAuthStore(state => state.signUp);
  const isSigningUp = useAuthStore(state => state.isSigningUp);

  const presetRole = route.params?.role;
  const [role, setRole] = useState<SignUpRole>(presetRole ?? 'Waiter');
  const [stepIndex, setStepIndex] = useState(presetRole ? 1 : 0);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyLegalName, setCompanyLegalName] = useState('');
  const [companyTradeName, setCompanyTradeName] = useState('');
  const [companyTaxId, setCompanyTaxId] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const [companyAddress, setCompanyAddress] = useState<Address>({});
  const [cnpjLookupState, setCnpjLookupState] = useState<
    'idle' | 'loading' | 'found' | 'notFound' | 'failed'
  >('idle');
  const [code, setCode] = useState('');
  const [verification, setVerification] = useState<{ id: string; phone: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSentPhone = useRef<string | null>(null);
  const sendingCode = useRef(false);

  const steps = role === 'CompanyOwner' ? COMPANY_STEPS : PROVIDER_STEPS;
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const cpfComplete = onlyDigits(cpf).length === 11;
  const cnpjComplete = onlyDigits(companyTaxId).length === 14;

  const hasPreviousStep = stepIndex > 0;
  useEffect(() => {
    if (!hasPreviousStep) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setError(null);
      setStepIndex(index => index - 1);
      return true;
    });

    return () => subscription.remove();
  }, [hasPreviousStep]);

  const phoneDigits = onlyDigits(phone);
  const isPhoneVerified = verification?.phone === phoneDigits;

  const sendCode = useCallback(
    async (resend: boolean) => {
      if (sendingCode.current) {
        return;
      }

      sendingCode.current = true;
      setError(null);
      setMessage(null);
      setIsSendingCode(true);
      lastSentPhone.current = phoneDigits;
      try {
        await authService.sendPhoneCode(phone);
        setCode('');
        setResendSeconds(RESEND_COOLDOWN_SECONDS);
        if (resend) {
          setMessage(t('signUp.codeResent'));
        }
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 409) {
          // The API still holds a code sent moments ago: it is on its way, not a failure.
          setResendSeconds(RESEND_COOLDOWN_SECONDS);
          setMessage(t('signUp.codeAlreadySent'));
        } else {
          setError(getErrorMessage(caught, t));
        }
      } finally {
        sendingCode.current = false;
        setIsSendingCode(false);
      }
    },
    [phone, phoneDigits, t],
  );

  const isCodeStep = step === 'code';
  useEffect(() => {
    if (isCodeStep && !isPhoneVerified && lastSentPhone.current !== phoneDigits) {
      void sendCode(false);
    }
  }, [isCodeStep, isPhoneVerified, phoneDigits, sendCode]);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setResendSeconds(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const companyTaxIdDigits = onlyDigits(companyTaxId);
  const lookedUpCnpj = useRef<string | null>(null);

  useEffect(() => {
    if (!isValidCnpj(companyTaxIdDigits)) {
      lookedUpCnpj.current = null;
      setCnpjLookupState('idle');
      return undefined;
    }

    if (lookedUpCnpj.current === companyTaxIdDigits) {
      return undefined;
    }

    lookedUpCnpj.current = companyTaxIdDigits;
    let cancelled = false;
    setCnpjLookupState('loading');

    lookupCnpj(companyTaxIdDigits)
      .then(found => {
        if (cancelled) {
          return;
        }

        if (!found) {
          setCnpjLookupState('notFound');
          return;
        }

        setCompanyLegalName(found.legalName);
        setCompanyTradeName(found.tradeName ?? '');
        setCompanyEmail(found.email ?? '');
        setCompanyPhone(found.phone ? maskPhone(found.phone) : '');
        setCompanyAddress({
          street: found.street,
          number: found.number,
          complement: found.complement,
          district: found.district,
          city: found.city,
          state: found.state,
          postalCode: found.postalCode,
        });
        setCnpjLookupState('found');
      })
      .catch(() => {
        if (!cancelled) {
          lookedUpCnpj.current = null;
          setCnpjLookupState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [companyTaxIdDigits, lookupAttempt]);

  const roleOptions = useMemo(
    () => [
      {
        value: 'Waiter' as const,
        icon: 'utensils' as const,
        label: t('signUp.providerLabel'),
        hint: t('signUp.providerHint'),
      },
      {
        value: 'CompanyOwner' as const,
        icon: 'building' as const,
        label: t('signUp.companyLabel'),
        hint: t('signUp.companyHint'),
      },
    ],
    [t],
  );

  function validate(current: StepId): string | null {
    switch (current) {
      case 'personal':
        if (!fullName.trim() || !cpf) {
          return t('errors.required');
        }
        return isValidCpf(cpf) ? null : t('auth.cpfInvalid');
      case 'company':
        if (!companyLegalName.trim() || !companyTaxId) {
          return t('errors.required');
        }
        return isValidCnpj(companyTaxId) ? null : t('auth.companyTaxIdInvalid');
      case 'contact':
        if (!email.trim() || !phone.trim()) {
          return t('errors.required');
        }
        return isEmail(email) ? null : t('signUp.emailInvalid');
      case 'companyContact':
        if (!companyEmail.trim() || !companyPhone.trim()) {
          return t('errors.required');
        }
        return isEmail(companyEmail) ? null : t('signUp.emailInvalid');
      case 'responsible':
        if (!fullName.trim() || !email.trim() || !phone.trim()) {
          return t('errors.required');
        }
        return isEmail(email) ? null : t('signUp.emailInvalid');
      case 'code':
        if (isPhoneVerified) {
          return null;
        }
        return code.length === CODE_LENGTH ? null : t('signUp.codeInvalid');
      case 'password':
        if (!password) {
          return t('errors.required');
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          return t('auth.passwordMin');
        }
        return password === confirmPassword ? null : t('signUp.passwordMismatch');
      default:
        return null;
    }
  }

  function goBack() {
    setError(null);
    if (hasPreviousStep) {
      setStepIndex(index => index - 1);
      return;
    }

    navigation.goBack();
  }

  async function submit() {
    setError(null);
    if (!verification) {
      return;
    }

    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        document: role === 'Waiter' ? onlyDigits(cpf) : undefined,
        password,
        phoneVerificationId: verification.id,
        role,
        device: await getDeviceInfo(),
        company: role === 'CompanyOwner'
          ? {
              legalName: companyLegalName.trim(),
              tradeName: companyTradeName.trim() || undefined,
              taxId: onlyDigits(companyTaxId),
              companyEmail: companyEmail.trim(),
              companyPhone: onlyDigits(companyPhone),
              address: companyAddress,
            }
          : undefined,
      });
    } catch (caught) {
      setError(getErrorMessage(caught, t));
    }
  }

  async function handleContinue() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    if (isLastStep) {
      await submit();
      return;
    }

    if (step === 'code' && !isPhoneVerified) {
      setIsVerifying(true);
      try {
        const result = await authService.verifyPhoneCode(phone, code);
        setVerification({ id: result.verificationId, phone: phoneDigits });
      } catch (caught) {
        setError(getErrorMessage(caught, t));
        return;
      } finally {
        setIsVerifying(false);
      }
    }

    setMessage(null);
    setStepIndex(index => index + 1);
  }

  return (
    <Screen
      scrollable
      edges={['top']}
      contentStyle={styles.content}
      footer={
        <View style={styles.footer}>
          <Button
            label={isLastStep ? t('signUp.finish') : t('common.continue')}
            onPress={handleContinue}
            loading={isSigningUp || isVerifying}
          />
          {stepIndex === 0 ? (
            <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.link}>
              <AppText variant="bodyStrong" color={colors.primary}>
                {t('auth.hasAccount')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      }>
      <ScreenHeader onBack={goBack} />
      <StepProgress current={stepIndex + 1} total={steps.length} />

      <View style={styles.body}>
        {step === 'profile' ? (
          <>
            <StepTitle title={t('signUp.profileTitle')} subtitle={t('signUp.profileSubtitle')} />
            <View style={styles.options}>
              {roleOptions.map(option => (
                <OptionCard
                  key={option.value}
                  icon={option.icon}
                  label={option.label}
                  hint={option.hint}
                  selected={role === option.value}
                  onPress={() => setRole(option.value)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 'personal' ? (
          <>
            <StepTitle title={t('signUp.personalTitle')} subtitle={t('signUp.personalSubtitle')} />
            <TextField
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              textContentType="name"
              placeholder={t('auth.fullNamePlaceholder')}
            />
            <TextField
              label={t('auth.cpf')}
              value={cpf}
              onChangeText={value => setCpf(maskCpf(value))}
              error={cpfComplete && !isValidCpf(cpf) ? t('auth.cpfInvalid') : null}
              keyboardType="number-pad"
              maxLength={14}
              placeholder="000.000.000-00"
            />
          </>
        ) : null}

        {step === 'contact' ? (
          <>
            <StepTitle title={t('signUp.contactTitle')} subtitle={t('signUp.contactSubtitle')} />
            <TextField
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="voce@email.com"
            />
            <TextField
              label={t('auth.phone')}
              value={phone}
              onChangeText={value => setPhone(maskPhone(value))}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="(11) 99999-9999"
            />
          </>
        ) : null}

        {step === 'company' ? (
          <>
            <StepTitle title={t('signUp.companyTitle')} subtitle={t('signUp.companySubtitle')} />
            <TextField
              label={t('auth.companyTaxId')}
              value={companyTaxId}
              onChangeText={value => setCompanyTaxId(maskCnpj(value))}
              error={cnpjComplete && !isValidCnpj(companyTaxId) ? t('auth.companyTaxIdInvalid') : null}
              keyboardType="number-pad"
              maxLength={18}
              placeholder="00.000.000/0000-00"
            />
            {cnpjLookupState === 'loading' ? (
              <View style={styles.lookupRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption" color={colors.textMuted}>
                  {t('signUp.cnpjSearching')}
                </AppText>
              </View>
            ) : null}
            {cnpjLookupState === 'found' ? (
              <AppText variant="captionStrong" color={colors.success}>
                {t('signUp.cnpjFound')}
              </AppText>
            ) : null}
            {cnpjLookupState === 'notFound' || cnpjLookupState === 'failed' ? (
              <AppText variant="caption" color={colors.textMuted}>
                {cnpjLookupState === 'notFound' ? t('signUp.cnpjNotFound') : t('signUp.cnpjUnavailable')}
              </AppText>
            ) : null}
            {cnpjLookupState === 'failed' ? (
              <Pressable onPress={() => setLookupAttempt(attempt => attempt + 1)}>
                <AppText variant="bodyStrong" color={colors.primary}>
                  {t('signUp.cnpjRetry')}
                </AppText>
              </Pressable>
            ) : null}
            <TextField
              label={t('auth.companyLegalName')}
              value={companyLegalName}
              onChangeText={setCompanyLegalName}
              placeholder={t('auth.companyLegalNamePlaceholder')}
            />
            <TextField
              label={t('auth.companyTradeName')}
              value={companyTradeName}
              onChangeText={setCompanyTradeName}
              placeholder={t('auth.companyTradeNamePlaceholder')}
            />
          </>
        ) : null}

        {step === 'companyContact' ? (
          <>
            <StepTitle
              title={t('signUp.companyContactTitle')}
              subtitle={t('signUp.companyContactSubtitle')}
            />
            <TextField
              label={t('auth.companyEmail')}
              value={companyEmail}
              onChangeText={setCompanyEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="empresa@email.com"
            />
            <TextField
              label={t('auth.companyPhone')}
              value={companyPhone}
              onChangeText={value => setCompanyPhone(maskPhone(value))}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="(11) 99999-9999"
            />
          </>
        ) : null}

        {step === 'responsible' ? (
          <>
            <StepTitle
              title={t('signUp.responsibleTitle')}
              subtitle={t('signUp.responsibleSubtitle')}
            />
            <TextField
              label={t('auth.fullName')}
              value={fullName}
              onChangeText={setFullName}
              textContentType="name"
              placeholder={t('auth.fullNamePlaceholder')}
            />
            <TextField
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="voce@email.com"
            />
            <TextField
              label={t('auth.phone')}
              value={phone}
              onChangeText={value => setPhone(maskPhone(value))}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              placeholder="(11) 99999-9999"
            />
          </>
        ) : null}

        {step === 'code' ? (
          <>
            <StepTitle
              title={t('signUp.codeTitle')}
              subtitle={t('signUp.codeSubtitle', { phone })}
            />
            <CodeInput
              label={t('signUp.codeLabel')}
              value={isPhoneVerified ? '' : code}
              onChange={setCode}
              length={CODE_LENGTH}
              editable={!isPhoneVerified}
              error={error !== null}
            />
            {isPhoneVerified ? (
              <AppText variant="captionStrong" color={colors.success}>
                {t('signUp.phoneVerified')}
              </AppText>
            ) : (
              <Pressable
                onPress={() => void sendCode(true)}
                disabled={resendSeconds > 0 || isSendingCode}
                style={styles.link}>
                <AppText
                  variant="bodyStrong"
                  color={resendSeconds > 0 || isSendingCode ? colors.textMuted : colors.primary}>
                  {resendSeconds > 0
                    ? t('signUp.resendIn', { seconds: resendSeconds })
                    : t('signUp.resend')}
                </AppText>
              </Pressable>
            )}
            {message ? (
              <AppText variant="caption" color={colors.textMuted} align="center">
                {message}
              </AppText>
            ) : null}
          </>
        ) : null}

        {step === 'password' ? (
          <>
            <StepTitle title={t('signUp.passwordTitle')} subtitle={t('signUp.passwordSubtitle')} />
            <PasswordField
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              textContentType="newPassword"
              placeholder="********"
            />
            <PasswordField
              label={t('signUp.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              textContentType="newPassword"
              placeholder="********"
              error={confirmPassword.length > 0 && !passwordsMatch}
            />
            <View style={styles.requirements}>
              <Requirement met={password.length >= MIN_PASSWORD_LENGTH} label={t('signUp.ruleLength')} />
              <Requirement met={passwordsMatch} label={t('signUp.ruleMatch')} />
            </View>
          </>
        ) : null}

        {error ? (
          <View style={styles.error}>
            <AppText variant="captionStrong" color={colors.danger}>
              {error}
            </AppText>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={styles.requirement}>
      <View style={[styles.requirementMark, met ? styles.requirementMarkMet : null]}>
        {met ? <Icon name="check" size={12} color={colors.onPrimary} /> : null}
      </View>
      <AppText variant="caption" color={met ? colors.success : colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.stepTitle}>
      <AppText variant="title">{title}</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  body: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  stepTitle: { gap: spacing.sm, marginBottom: spacing.sm },
  options: { gap: spacing.md },
  lookupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  requirements: { gap: spacing.sm, paddingTop: spacing.xs },
  requirement: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  requirementMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementMarkMet: { backgroundColor: colors.success, borderColor: colors.success },
  footer: { gap: spacing.sm },
  link: { alignItems: 'center', paddingVertical: spacing.sm },
  error: {
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
