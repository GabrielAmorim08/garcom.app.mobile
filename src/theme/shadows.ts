import { Platform, ViewStyle } from 'react-native';

/** Cards sit just above the cream ground: a soft, warm shadow, never a hard drop. */
export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#6B5B45',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  })!,
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#3D3327',
      shadowOpacity: 0.18,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 8 },
    default: {},
  })!,
} as const;
