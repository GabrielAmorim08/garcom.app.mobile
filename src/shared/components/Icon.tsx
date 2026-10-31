import React from 'react';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

import { colors } from '../../theme';

/**
 * Small hand-rolled icon set. A font-based library would drag native asset
 * configuration into both platforms for a dozen glyphs.
 */
export type IconName =
  | 'calendar'
  | 'clock'
  | 'pin'
  | 'utensils'
  | 'building'
  | 'dots'
  | 'check'
  | 'chevronLeft'
  | 'chevronRight'
  | 'home'
  | 'search'
  | 'message'
  | 'user'
  | 'filter'
  | 'navigate'
  | 'plus'
  | 'minus'
  | 'star'
  | 'users'
  | 'note'
  | 'party'
  | 'chart';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Filled icons (star, check badge) use this instead of a stroke. */
  filled?: boolean;
}

export function Icon({ name, size = 20, color = colors.textPrimary, filled = false }: IconProps) {
  const stroke = filled ? 'none' : color;
  const fill = filled ? color : 'none';
  const common = { stroke, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderPaths(name, common, color, filled)}
    </Svg>
  );
}

type PathProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round';
  strokeLinejoin: 'round';
  fill: string;
};

function renderPaths(name: IconName, p: PathProps, color: string, filled: boolean) {
  switch (name) {
    case 'calendar':
      return (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={3} {...p} />
          <Path d="M8 3v4M16 3v4M3 10h18" {...p} />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Polyline points="12 7 12 12 15.5 14" {...p} />
        </>
      );
    case 'pin':
      return (
        <>
          <Path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" {...p} />
          <Circle cx={12} cy={10} r={2.6} {...p} />
        </>
      );
    case 'utensils':
      return (
        <>
          <Path d="M7 3v8a2.5 2.5 0 0 0 5 0V3M9.5 11v10" {...p} />
          <Path d="M17.5 3c-1.4 1.2-2 3-2 5.2 0 1.6.7 2.6 2 2.8V21" {...p} />
        </>
      );
    case 'building':
      return (
        <>
          <Rect x={4} y={3} width={16} height={18} rx={2} {...p} />
          <Path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" {...p} />
        </>
      );
    case 'dots':
      return (
        <>
          <Circle cx={6} cy={12} r={1.6} fill={color} stroke="none" />
          <Circle cx={12} cy={12} r={1.6} fill={color} stroke="none" />
          <Circle cx={18} cy={12} r={1.6} fill={color} stroke="none" />
        </>
      );
    case 'check':
      return <Polyline points="4.5 12.5 9.5 17.5 19.5 6.5" {...p} strokeWidth={2.4} fill="none" />;
    case 'chevronLeft':
      return <Polyline points="15 5 8 12 15 19" {...p} fill="none" />;
    case 'chevronRight':
      return <Polyline points="9 5 16 12 9 19" {...p} fill="none" />;
    case 'home':
      return (
        <>
          <Path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" {...p} />
          <Path d="M9.5 21v-6h5v6" {...p} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={7} {...p} />
          <Path d="m16.2 16.2 4 4" {...p} />
        </>
      );
    case 'message':
      return <Path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4Z" {...p} />;
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8} r={4} {...p} />
          <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" {...p} />
        </>
      );
    case 'users':
      return (
        <>
          <Circle cx={9} cy={8} r={3.4} {...p} />
          <Path d="M3 19a6 6 0 0 1 12 0" {...p} />
          <Path d="M16 5.5a3.4 3.4 0 0 1 0 6.6M17 19a6 6 0 0 0-1.6-4" {...p} />
        </>
      );
    case 'filter':
      return <Path d="M4 6h16M7 12h10M10 18h4" {...p} />;
    case 'navigate':
      return <Path d="M21 3 3 10.5l7.5 3L13.5 21Z" {...p} />;
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...p} strokeWidth={2} />;
    case 'minus':
      return <Path d="M5 12h14" {...p} strokeWidth={2} />;
    case 'star':
      return (
        <Path
          d="m12 3.5 2.7 5.5 6 .9-4.35 4.2 1.03 6L12 17.3 6.62 20.1l1.03-6L3.3 9.9l6-.9Z"
          {...p}
          fill={filled ? color : 'none'}
        />
      );
    case 'note':
      return (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={3} {...p} />
          <Path d="M8 9h8M8 13h8M8 17h5" {...p} />
        </>
      );
    case 'party':
      return (
        <>
          <Path d="M4 20 9 8l7 7Z" {...p} />
          <Path d="M14 4v2M18.5 5.5 17 7M20 10h-2" {...p} />
        </>
      );
    case 'chart':
      return (
        <>
          <Path d="M4 20h16" {...p} />
          <Path d="M7 17v-4M12 17V7M17 17v-7" {...p} strokeWidth={2.2} />
        </>
      );
    default:
      return null;
  }
}
