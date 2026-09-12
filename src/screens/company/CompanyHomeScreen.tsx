import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AppText, Button, Screen } from '../../shared/components';
import { HeroBackdrop } from '../../shared/components/HeroBackdrop';
import { Wordmark } from '../../shared/components/Wordmark';
import { colors, spacing } from '../../theme';

/**
 * Company landing screen: dark cover with the value proposition and the two
 * actions that start the flow.
 */
export function CompanyHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Screen background={colors.heroBackground} edges={['top']}>
      <HeroBackdrop>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <Wordmark tone="dark" size={22} />
          </View>

          <View style={styles.heroCopy}>
            <AppText variant="display" color={colors.textOnDark}>
              {t('company.home.heroTitle')}
            </AppText>
            <AppText variant="body" color={colors.onHeroMuted}>
              {t('company.home.heroSubtitle')}
            </AppText>
          </View>

          <View style={styles.actions}>
            <Button
              label={t('company.home.requestWaiter')}
              onPress={() => navigation.navigate('NewRequestStepOne')}
            />
            <Button
              label={t('company.home.myServices')}
              variant="secondary"
              onPress={() => navigation.navigate('CompanyTabs', { screen: 'CompanyServices' })}
            />
          </View>
        </View>
      </HeroBackdrop>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  brandRow: { alignItems: 'center' },
  heroCopy: { gap: spacing.md, marginBottom: spacing.xxl },
  actions: { gap: spacing.md },
});
