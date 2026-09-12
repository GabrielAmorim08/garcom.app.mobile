import React from 'react';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

import { Icon, IconName } from '../shared/components';
import { colors, typography } from '../theme';

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

export const tabBarStyle: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primaryPressed,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { ...typography.overline, textTransform: 'none' },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
};
