import React from 'react';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '../shared/components';
import { TAB_BAR_FLOAT_GAP, TAB_BAR_HEIGHT } from '../shared/hooks/useTabBarClearance';
import { colors, radius, shadows, spacing, typography } from '../theme';

/**
 * One place for the tab bar's look, so the company and waiter navigators cannot
 * drift apart.
 */
export function tabScreenOptions(icon: IconName, label: string): BottomTabNavigationOptions {
  return {
    title: label,
    tabBarIcon: ({ color, size }) => <Icon name={icon} size={size} color={color} />,
  };
}

/**
 * A bar laid over the screen: absolutely positioned, rounded, lifted off the bottom
 * edge and inset from the sides, so whatever is behind it (a dark hero, a list)
 * carries on underneath. The system navigation area is added to the lift by hand,
 * otherwise Android's three-button navigation would sit on top of the tabs.
 * Screens reserve room for it through useTabBarClearance.
 */
export function useTabBarOptions(): BottomTabNavigationOptions {
  const insets = useSafeAreaInsets();

  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primaryPressed,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { ...typography.overline, textTransform: 'none' },
    tabBarStyle: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: insets.bottom + TAB_BAR_FLOAT_GAP,
      height: TAB_BAR_HEIGHT,
      backgroundColor: colors.surface,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      borderTopWidth: 0,
      borderRadius: radius.xl,
      ...shadows.floating,
    },
  };
}
