/**
 * Palette taken from the ServeUp visual identity: warm gold over a cream ground,
 * with an almost-black ink used for hero areas and primary text.
 */
export const palette = {
  gold: '#B08D57',
  goldDark: '#8F6F3F',
  goldSoft: '#E8DCC6',
  goldWash: '#F3EBDC',

  ink: '#14110F',
  ink80: '#2A2522',
  ink60: '#57504A',
  ink40: '#8A817A',
  ink20: '#C4BCB4',

  cream: '#F7F4EF',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF9F5',
  border: '#E7E0D5',

  success: '#2E7D53',
  successSoft: '#E6F2EA',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  info: '#2F6FB3',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(20, 17, 15, 0.55)',
} as const;

export const colors = {
  /** Brand accent: primary buttons, active states, prices. */
  primary: palette.gold,
  primaryPressed: palette.goldDark,
  primarySoft: palette.goldWash,
  onPrimary: palette.white,

  background: palette.cream,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  border: palette.border,

  /** Dark hero blocks (home header, cover images). */
  heroBackground: palette.ink,
  onHero: palette.white,
  onHeroMuted: 'rgba(255, 255, 255, 0.72)',

  textPrimary: palette.ink,
  textSecondary: palette.ink60,
  textMuted: palette.ink40,
  textOnDark: palette.white,

  success: palette.success,
  successSoft: palette.successSoft,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  info: palette.info,

  overlay: palette.overlay,
} as const;

export type Colors = typeof colors;
