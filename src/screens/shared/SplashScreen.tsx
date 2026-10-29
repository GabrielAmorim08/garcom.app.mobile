import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../shared/components';
import { AnimatedLogo } from '../../shared/components/AnimatedLogo';
import { BowTie } from '../../shared/components/Wordmark';
import { appVersion, splashAnimationEnabled } from '../../shared/appInfo';
import { colors, spacing } from '../../theme';

interface SplashScreenProps {
  /** Called once the logo animation has played to its end. */
  onFinished?: () => void;
}

function hideNativeSplash() {
  void RNBootSplash.hide({ fade: true });
}

const STATIC_BOW_WIDTH = 62;

/** Same bow tie the native opening screen shows, so handing over from it is invisible. */
function StaticSplash() {
  useEffect(() => {
    hideNativeSplash();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BowTie width={STATIC_BOW_WIDTH} color={colors.primary} />
    </View>
  );
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => () => hideNativeSplash(), []);

  if (!splashAnimationEnabled) {
    return <StaticSplash />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AnimatedLogo onReady={hideNativeSplash} onFinished={onFinished} />

      <AppText
        variant="caption"
        color={colors.onHeroMuted}
        align="center"
        style={[styles.version, { bottom: insets.bottom + spacing.xl }]}>
        {t('splash.version', { version: appVersion })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.heroBackground,
  },
  version: { position: 'absolute' },
});
