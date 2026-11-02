import React from 'react';
import {
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { useKeyboardVisible } from '../hooks/useKeyboardVisible';
import { useTabBarClearance } from '../hooks/useTabBarClearance';
import { colors, spacing } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Wraps the content in a ScrollView. Turn off for screens that own a FlatList. */
  scrollable?: boolean;
  /** Pinned to the bottom, outside the scroll area — primary actions live here. */
  footer?: React.ReactNode;
  edges?: Edge[];
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /**
   * Lets the content run underneath the floating tab bar instead of stopping above
   * it. The screen then reserves the room itself, through useTabBarClearance.
   */
  bleedUnderTabBar?: boolean;
}

export function Screen({
  children,
  scrollable = false,
  footer,
  edges = ['top'],
  background = colors.background,
  contentStyle,
  bleedUnderTabBar = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardVisible();
  // The keyboard already covers the system navigation area, so counting it again would leave a gap.
  const footerInset = keyboardVisible ? 0 : insets.bottom;
  const tabBarClearance = useTabBarClearance();
  // The keyboard goes over the screen on both systems instead of pushing it up. iOS makes
  // room in the scroll by itself; on Android the scroll gets the keyboard's height as extra
  // room at the end, so the last fields can still be scrolled above the keyboard.
  const keyboardHeight = useKeyboardHeight();
  const androidKeyboardRoom = Platform.OS === 'android' ? keyboardHeight : 0;

  const scrollPaddingBottom =
    ((StyleSheet.flatten(contentStyle)?.paddingBottom as number | undefined) ?? spacing.xxl) +
    tabBarClearance +
    androidKeyboardRoom;

  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle, { paddingBottom: scrollPaddingBottom }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        contentStyle,
        bleedUnderTabBar ? null : { marginBottom: tabBarClearance },
      ]}>
      {children}
    </View>
  );

  const content = (
    <>
      {body}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: spacing.lg + footerInset }]}>
          {footer}
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }]} edges={edges}>
      <View style={styles.flex}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
