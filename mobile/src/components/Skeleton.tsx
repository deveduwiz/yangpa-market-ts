import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, useColors } from '../theme';

/** 은은하게 깜빡이는 회색 블록. 첫 로딩 때 스피너 대신 쓴다. */
export function SkeletonBlock({
  width,
  height,
  style,
  round = radius.sm,
}: {
  width?: number | `${number}%`;
  height: number;
  style?: StyleProp<ViewStyle>;
  round?: number;
}) {
  const c = useColors();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: round, backgroundColor: c.surface2, opacity: pulse },
        style,
      ]}
    />
  );
}

/** 카드형 목록 스켈레톤 */
export function TileSkeleton({ width }: { width: number }) {
  const c = useColors();
  return (
    <View style={[styles.tile, { width, borderColor: c.border }]}>
      <SkeletonBlock width={width - 2} height={width - 2} round={0} />
      <View style={styles.tileBody}>
        <SkeletonBlock width="70%" height={14} />
        <SkeletonBlock width="45%" height={15} />
        <SkeletonBlock width="55%" height={11} />
      </View>
    </View>
  );
}

/** 목록형 스켈레톤 */
export function RowSkeleton() {
  const c = useColors();
  return (
    <View style={[styles.row, { borderColor: c.border }]}>
      <SkeletonBlock width={78} height={78} />
      <View style={styles.rowBody}>
        <SkeletonBlock width="60%" height={15} />
        <SkeletonBlock width="90%" height={12} />
        <SkeletonBlock width="40%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  tileBody: { padding: 12, gap: 6 },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  rowBody: { flex: 1, gap: 7 },
});
