import { Pressable, StyleSheet, View } from 'react-native';
import { GridIcon, ListIcon } from './icons';
import { radius, useColors } from '../theme';
import type { ViewMode } from '../storage';

const LABELS: Record<ViewMode, string> = { card: '카드형 보기', list: '목록형 보기' };

/**
 * 카드형 / 목록형 전환.
 * 아이콘은 icons.tsx 의 것을 그대로 쓴다 — 여기서 따로 그리면 구현이 갈라진다.
 */
export default function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  const c = useColors();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="보기 방식"
      style={[styles.group, { borderColor: c.borderStrong, backgroundColor: c.bg }]}
    >
      {(['card', 'list'] as const).map((mode) => {
        const isActive = value === mode;
        const color = isActive ? c.text : c.text3;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={LABELS[mode]}
            android_ripple={{ color: c.surface2 }}
            style={({ pressed }) => [
              styles.btn,
              isActive && { backgroundColor: c.surface2 },
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            {mode === 'card' ? (
              <GridIcon size={17} color={color} />
            ) : (
              <ListIcon size={17} color={color} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  btn: { paddingVertical: 9, paddingHorizontal: 11 },
});
