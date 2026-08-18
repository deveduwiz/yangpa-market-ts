import { useMemo } from 'react';
import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';

/**
 * fe/src/index.css 의 CSS 변수(그레이 스케일 토큰)를 그대로 옮겨온 값들.
 * 웹과 모바일이 같은 톤을 공유하도록 이름도 동일하게 맞췄다.
 */
export type Colors = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  danger: string;
  dangerBg: string;
  dangerBorder: string;
  ok: string;
  okBg: string;
  okBorder: string;
  warn: string;
  warnBg: string;
  warnBorder: string;
  shadow: string;
};

export const lightColors: Colors = {
  bg: '#ffffff',
  surface: '#fafafa',
  surface2: '#f4f4f5',
  border: '#e4e4e7',
  borderStrong: '#d4d4d8',
  text: '#18181b',
  text2: '#52525b',
  text3: '#a1a1aa',
  accent: '#18181b',
  accentText: '#ffffff',
  accentSoft: '#f4f4f5',
  danger: '#b91c1c',
  dangerBg: '#fef2f2',
  dangerBorder: '#fecaca',
  ok: '#166534',
  okBg: '#f0fdf4',
  okBorder: '#bbf7d0',
  warn: '#92400e',
  warnBg: '#fffbeb',
  warnBorder: '#fde68a',
  shadow: '#18181b',
};

export const darkColors: Colors = {
  bg: '#09090b',
  surface: '#111113',
  surface2: '#18181b',
  border: '#27272a',
  borderStrong: '#3f3f46',
  text: '#fafafa',
  text2: '#a1a1aa',
  text3: '#71717a',
  accent: '#fafafa',
  accentText: '#09090b',
  accentSoft: '#1c1c1f',
  danger: '#f87171',
  dangerBg: 'rgba(248, 113, 113, 0.10)',
  dangerBorder: 'rgba(248, 113, 113, 0.28)',
  ok: '#4ade80',
  okBg: 'rgba(74, 222, 128, 0.10)',
  okBorder: 'rgba(74, 222, 128, 0.28)',
  warn: '#fbbf24',
  warnBg: 'rgba(251, 191, 36, 0.10)',
  warnBorder: 'rgba(251, 191, 36, 0.28)',
  shadow: '#000000',
};

export const radius = { lg: 16, md: 12, sm: 8, xs: 6 } as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

/** 웹의 --shadow-sm / --shadow-md 에 대응하는 플랫폼별 그림자 */
export const shadow = (c: Colors, level: 'sm' | 'md'): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: c.shadow,
      shadowOpacity: level === 'sm' ? 0.06 : 0.12,
      shadowRadius: level === 'sm' ? 2 : 12,
      shadowOffset: { width: 0, height: level === 'sm' ? 1 : 4 },
    },
    android: { elevation: level === 'sm' ? 1 : 4 },
    default: {},
  })!;

/** 웹의 letter-spacing: -0.02em 같은 타이포 보정 */
export const heading: TextStyle = {
  fontWeight: '600',
  letterSpacing: -0.4,
};

export function useColors(): Colors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

/**
 * StyleSheet은 정적이라 색상 토큰을 못 받는다.
 * 팩토리를 모듈 최상위에 두면 참조가 고정되므로 useMemo 캐시가 제대로 먹는다.
 */
export function useThemedStyles<T>(factory: (c: Colors) => T): T {
  const c = useColors();
  return useMemo(() => factory(c), [c, factory]);
}
