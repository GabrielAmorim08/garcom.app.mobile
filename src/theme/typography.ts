import { Platform, TextStyle } from 'react-native';

/**
 * System fonts for now. When the brand typeface is chosen, only these two
 * constants change.
 */
export const fontFamily = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
} as const;

const base: TextStyle = {
  fontFamily: fontFamily.regular,
  includeFontPadding: false,
};

export const typography = {
  /** Screen-defining headline, used once per screen. */
  display: { ...base, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title: { ...base, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  subtitle: { ...base, fontSize: 18, lineHeight: 24, fontWeight: '600' },
  bodyStrong: { ...base, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  body: { ...base, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { ...base, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { ...base, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  overline: { ...base, fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.6 },
  price: { ...base, fontSize: 20, lineHeight: 26, fontWeight: '700' },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
