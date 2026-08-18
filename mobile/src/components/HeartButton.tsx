import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { api } from '../api';
import { HeartIcon } from './icons';
import { useColors } from '../theme';

const FAVORITE_RED = '#ef4444';

/**
 * 찜 버튼. 탭하면 화면이 먼저 바뀌고(낙관적), 실패하면 되돌린다.
 * 목록에서는 사진 위에 얹히므로 반투명 칩을 깔아 대비를 확보한다.
 */
export default function HeartButton({
  saleId,
  isFavorite,
  favoriteCount,
  onChange,
  variant = 'overlay',
  size = 20,
}: {
  saleId: number;
  isFavorite: boolean;
  favoriteCount?: number;
  onChange: (next: { isFavorite: boolean; favoriteCount: number }) => void;
  /** overlay = 사진 위 칩, plain = 배경 없이 */
  variant?: 'overlay' | 'plain';
  size?: number;
}) {
  const c = useColors();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (busy) return;
    const next = !isFavorite;
    const prevCount = favoriteCount ?? 0;

    setBusy(true);
    onChange({ isFavorite: next, favoriteCount: Math.max(0, prevCount + (next ? 1 : -1)) });

    try {
      const res = await api.setFavorite(saleId, next);
      onChange({ isFavorite: res.isFavorite, favoriteCount: res.favoriteCount });
    } catch {
      onChange({ isFavorite: !next, favoriteCount: prevCount });
    } finally {
      setBusy(false);
    }
  };

  const isOverlay = variant === 'overlay';
  // 외곽선 하트의 안쪽을 배경색으로 메워야 테두리만 남는다
  const hollow = isOverlay ? 'rgba(0,0,0,0.35)' : c.bg;
  const stroke = isOverlay ? '#ffffff' : c.text3;

  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? '찜 해제' : '찜하기'}
      accessibilityState={{ selected: isFavorite }}
      android_ripple={isOverlay ? undefined : { color: c.surface2, borderless: true, radius: 22 }}
      style={({ pressed }) => [
        styles.base,
        isOverlay && [styles.overlay, { backgroundColor: 'rgba(0,0,0,0.35)' }],
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <HeartIcon
        size={size}
        color={isFavorite ? FAVORITE_RED : stroke}
        filled={isFavorite}
        hollowColor={hollow}
      />
      {variant === 'plain' && favoriteCount !== undefined && (
        <Text style={[styles.count, { color: isFavorite ? FAVORITE_RED : c.text3 }]}>
          {favoriteCount}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
      android: {},
      default: {},
    }),
  },
  count: { fontSize: 13, fontWeight: '600', minWidth: 12 },
});
