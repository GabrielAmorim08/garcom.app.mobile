import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { providerKindKey } from '../../entities/jobPost/providerKinds';
import { KindStatsList } from '../../entities/user/components/KindStatsList';
import { useFindMember } from '../../entities/user/useUser';
import { getErrorMessage } from '../../shared/api/errorMessage';
import { AppText, Avatar, Button, Card, Screen, ScreenHeader, TextField } from '../../shared/components';
import { formatMemberNumber, formatRating } from '../../shared/utils/format';
import { onlyDigits } from '../../shared/utils/masks';
import { colors, spacing } from '../../theme';

const MEMBER_NUMBER_LENGTH = 7;

/** Lets a company find a provider by the number printed on their member card. */
export function MemberLookupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { mutateAsync: findMember, data: member, isPending, reset } = useFindMember();

  const [number, setNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function search() {
    const digits = onlyDigits(number);
    if (!digits) {
      setError(t('member.lookup.invalid'));
      return;
    }

    setError(null);
    try {
      await findMember(Number(digits));
    } catch (caught) {
      setError(getErrorMessage(caught, t));
    }
  }

  return (
    <Screen>
      <ScreenHeader title={t('member.lookup.title')} onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField
          label={t('member.lookup.label')}
          value={number}
          onChangeText={value => {
            setNumber(onlyDigits(value).slice(0, MEMBER_NUMBER_LENGTH));
            setError(null);
            reset();
          }}
          keyboardType="number-pad"
          maxLength={MEMBER_NUMBER_LENGTH}
          placeholder="0000050"
          error={error}
        />
        <Button label={t('member.lookup.action')} loading={isPending} onPress={search} />

        {member ? (
          <Card style={styles.card}>
            <View style={styles.header}>
              <Avatar name={member.fullName} uri={member.profilePhotoPath} size={64} />
              <View style={styles.headerCopy}>
                <AppText variant="subtitle">{member.fullName}</AppText>
                <AppText variant="captionStrong" color={colors.primaryPressed}>
                  {t('member.number', { number: formatMemberNumber(member.memberNumber) })}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {member.ratingsCount > 0
                    ? `${formatRating(member.averageRating)} · ${t('company.serviceDetail.reviewCount', { count: member.ratingsCount })}`
                    : t('company.serviceDetail.noReviews')}
                </AppText>
              </View>
            </View>

            {member.providerKinds.length > 0 ? (
              <AppText variant="body" color={colors.textSecondary}>
                {member.providerKinds
                  .map(kind => t(`serviceRequest.step1.providers.${providerKindKey(kind)}.label` as never))
                  .join(' · ')}
              </AppText>
            ) : null}

            <AppText variant="subtitle">{t('member.stats.title')}</AppText>
            <KindStatsList stats={member.kindStats} />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge, gap: spacing.lg },
  card: { gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
});
