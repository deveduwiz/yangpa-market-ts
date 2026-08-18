import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

/**
 * View 로만 그린 아이콘 모음.
 * react-native-svg 를 안 쓰므로 Expo Go 에서 추가 네이티브 모듈 없이 동작하고,
 * iOS·Android 렌더링 차이도 없다.
 */

type IconProps = { size?: number; color: string; style?: StyleProp<ViewStyle> };

const box = (size: number, style?: StyleProp<ViewStyle>): StyleProp<ViewStyle> => [
  { width: size, height: size },
  style,
];

/** 집 — 지붕(45° 회전한 사각형) + 몸통 */
export function HomeIcon({ size = 24, color, filled = false, style }: IconProps & { filled?: boolean }) {
  const s = size;
  const w = Math.max(1.6, s * 0.075);
  return (
    <View style={box(s, style)}>
      <View
        style={{
          position: 'absolute',
          top: s * 0.06,
          left: s * 0.2,
          width: s * 0.6,
          height: s * 0.6,
          borderTopWidth: w,
          borderLeftWidth: w,
          borderColor: color,
          borderTopLeftRadius: s * 0.12,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: s * 0.1,
          left: s * 0.22,
          width: s * 0.56,
          height: s * 0.42,
          borderWidth: w,
          borderTopWidth: 0,
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
          borderBottomLeftRadius: s * 0.08,
          borderBottomRightRadius: s * 0.08,
        }}
      />
    </View>
  );
}

/**
 * 하트. MaterialDesignIcons의 cards-heart / cards-heart-outline 사용.
 */
export function HeartIcon({
  size = 24,
  color,
  filled = false,
  hollowColor = '#ffffff',
  style,
}: IconProps & { filled?: boolean; hollowColor?: string }) {
  return (
    <MaterialDesignIcons
      name={filled ? 'cards-heart' : 'cards-heart-outline'}
      size={size}
      color={color}
      style={style}
    />
  );
}

/** 더하기 */
export function PlusIcon({ size = 24, color, style }: IconProps) {
  const s = size;
  const w = Math.max(1.8, s * 0.085);
  return (
    <View style={[box(s, style), styles.center]}>
      <View style={{ position: 'absolute', width: s * 0.62, height: w, borderRadius: w, backgroundColor: color }} />
      <View style={{ position: 'absolute', width: w, height: s * 0.62, borderRadius: w, backgroundColor: color }} />
    </View>
  );
}

/** 사람 — 머리 + 어깨 */
export function UserIcon({ size = 24, color, filled = false, style }: IconProps & { filled?: boolean }) {
  const s = size;
  const w = Math.max(1.6, s * 0.075);
  const head = s * 0.34;
  return (
    <View style={box(s, style)}>
      <View
        style={{
          position: 'absolute',
          top: s * 0.12,
          left: (s - head) / 2,
          width: head,
          height: head,
          borderRadius: head / 2,
          borderWidth: filled ? 0 : w,
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: s * 0.1,
          left: s * 0.16,
          width: s * 0.68,
          height: s * 0.34,
          borderWidth: filled ? 0 : w,
          borderBottomWidth: 0,
          borderColor: color,
          backgroundColor: filled ? color : 'transparent',
          borderTopLeftRadius: s * 0.34,
          borderTopRightRadius: s * 0.34,
        }}
      />
    </View>
  );
}

/** 돋보기 */
export function SearchIcon({ size = 20, color, style }: IconProps) {
  const s = size;
  const w = Math.max(1.5, s * 0.09);
  const lens = s * 0.68;
  return (
    <View style={box(s, style)}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          borderWidth: w,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: s * 0.03,
          bottom: s * 0.07,
          width: s * 0.33,
          height: w,
          borderRadius: w,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** 휴지통 */
export function TrashIcon({ size = 20, color, style }: IconProps) {
  const s = size;
  const w = Math.max(1.4, s * 0.08);
  return (
    <View style={box(s, style)}>
      <View
        style={{
          position: 'absolute',
          top: s * 0.14,
          left: s * 0.12,
          width: s * 0.76,
          height: w,
          borderRadius: w,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: s * 0.02,
          left: s * 0.36,
          width: s * 0.28,
          height: s * 0.12,
          borderTopWidth: w,
          borderLeftWidth: w,
          borderRightWidth: w,
          borderColor: color,
          borderTopLeftRadius: w,
          borderTopRightRadius: w,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: s * 0.26,
          left: s * 0.22,
          width: s * 0.56,
          height: s * 0.62,
          borderWidth: w,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: s * 0.1,
          borderBottomRightRadius: s * 0.1,
        }}
      />
    </View>
  );
}

/** 오른쪽 꺾쇠 */
export function ChevronRightIcon({ size = 18, color, style }: IconProps) {
  const s = size;
  const w = Math.max(1.4, s * 0.1);
  return (
    <View style={[box(s, style), styles.center]}>
      <View
        style={{
          width: s * 0.36,
          height: s * 0.36,
          borderTopWidth: w,
          borderRightWidth: w,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** 카드형 보기 — 2x2 격자 */
export function GridIcon({ size = 17, color, style }: IconProps) {
  const s = size;
  const cell = s * 0.41;
  return (
    <View style={[box(s, style), styles.wrapBox]}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{ width: cell, height: cell, borderWidth: 1.4, borderColor: color, borderRadius: 2 }}
        />
      ))}
    </View>
  );
}

/** 목록형 보기 — 가로줄 두 개 + 밑줄 */
export function ListIcon({ size = 17, color, style }: IconProps) {
  const s = size;
  const bar = { width: s, borderWidth: 1.4, borderColor: color, borderRadius: 2 } as const;
  return (
    // 막대 폭을 직접 지정한다 — 부모의 alignItems/flexWrap 설정에 좌우되지 않게.
    <View style={[box(s, style), styles.column]}>
      <View style={[bar, { height: s * 0.27 }]} />
      <View style={[bar, { height: s * 0.27 }]} />
      <View style={{ width: s, height: 1.4, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  column: { flexDirection: 'column', flexWrap: 'nowrap', justifyContent: 'space-between' },
  wrapBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
});
