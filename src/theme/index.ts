export { colors, palette } from './colors';
export type { Colors } from './colors';
export { spacing, radius, hitSlop } from './spacing';
export type { Spacing } from './spacing';
export { typography, fontFamily } from './typography';
export type { TypographyVariant } from './typography';
export { shadows } from './shadows';

import { colors } from './colors';
import { radius, spacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export const theme = { colors, spacing, radius, typography, shadows } as const;
export type Theme = typeof theme;
