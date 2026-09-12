import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AppText, Button, Screen, SuccessSeal } from '../../shared/components';
import { colors, spacing } from '../../theme';

/** Confirmation after the request is created. No back gesture: the flow is done. */
export function RequestSentScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  function goHome() {
    navigation.reset({ index: 0, routes: [{ name: 'CompanyTabs' }] });
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.body}>
          <SuccessSeal />

          <AppText variant="title" align="center">
            {t('serviceRequest.sent.title')}
          </AppText>

          <AppText variant="body" color={colors.textSecondary} align="center">
            {t('serviceRequest.sent.message')}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button
            label={t('serviceRequest.sent.track')}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'CompanyTabs', params: { screen: 'CompanyServices' } }],
            })}
          />
          <Button label={t('serviceRequest.sent.backHome')} variant="ghost" onPress={goHome} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.huge,
  },
  body: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  actions: { gap: spacing.sm },
});
