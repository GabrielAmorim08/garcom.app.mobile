import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { AppText, Screen } from '../shared/components';
import { colors, radius, spacing } from '../theme';
import { AppHeader } from './AppHeader';

interface TabScreenProps {
  /** Large title under the logo row. */
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Frame shared by the screens behind the tab bar: a dark header band (logo, avatar,
 * title) over a rounded cream sheet that holds the content. The sheet runs under the
 * floating tab bar, so what it holds must leave room for it (useTabBarClearance).
 */
export function TabScreen({ title, subtitle, children }: TabScreenProps) {
  const isFocused = useIsFocused();

  return (
    <Screen background={colors.heroBackground} bleedUnderTabBar>
      {isFocused ? <StatusBar barStyle="light-content" /> : null}

      <View style={styles.header}>
        <AppHeader />

        {title ? (
          <View style={styles.titles}>
            <AppText variant="title" color={colors.textOnDark}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" color={colors.onHeroMuted}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.sheet}>{children}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  titles: { gap: 2 },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
  },
});
