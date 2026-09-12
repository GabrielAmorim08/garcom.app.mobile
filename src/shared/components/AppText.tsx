import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { colors, typography, TypographyVariant } from '../../theme';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

/** Single entry point for text, so no screen hardcodes a font size. */
export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  align,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[typography[variant], { color, textAlign: align }, style]} />;
}
