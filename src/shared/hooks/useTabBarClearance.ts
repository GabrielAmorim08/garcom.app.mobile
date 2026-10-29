import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '../../theme';

export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_FLOAT_GAP = spacing.sm;

const CONTENT_GAP = spacing.md;

/**
 * Space a screen must leave at its bottom so nothing hides behind the floating tab
 * bar. It is zero outside a tab navigator, so shared components can call it blindly.
 */
export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  const insideTabs = useContext(BottomTabBarHeightContext);

  if (!insideTabs) {
    return 0;
  }

  return TAB_BAR_HEIGHT + insets.bottom + TAB_BAR_FLOAT_GAP + CONTENT_GAP;
}
