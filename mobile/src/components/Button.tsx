import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { radius, useColors } from '../theme';

type Variant = 'primary' | 'ghost';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  active = false,
  compact = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  busy?: boolean;
  /** ghost 버튼의 토글 on 상태 (웹의 .is-active) */
  active?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const isPrimary = variant === 'primary';
  const off = disabled || busy;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, selected: active }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        {
          backgroundColor: isPrimary
            ? c.accent
            : active
              ? c.surface2
              : pressed
                ? c.surface2
                : 'transparent',
          borderColor: isPrimary ? c.accent : c.borderStrong,
          opacity: off ? 0.5 : pressed && isPrimary ? 0.85 : 1,
        },
        style,
      ]}
    >
      {busy && (
        <ActivityIndicator
          size="small"
          color={isPrimary ? c.accentText : c.text}
          style={styles.spinner}
        />
      )}
      <Text
        numberOfLines={1}
        style={[styles.label, { color: isPrimary ? c.accentText : c.text }]}
      >
        {title}
      </Text>
      {busy && <View style={styles.spinner} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  compact: { paddingVertical: 8, paddingHorizontal: 12 },
  label: { fontSize: 14, fontWeight: '500' },
  spinner: { marginRight: 8, width: 16 },
});
