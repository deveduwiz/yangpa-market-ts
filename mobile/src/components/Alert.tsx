import { StyleSheet, Text, View } from 'react-native';
import { radius, useColors } from '../theme';

type Tone = 'error' | 'warn' | 'ok';

export default function Alert({ tone = 'error', message }: { tone?: Tone; message: string }) {
  const c = useColors();
  const palette = {
    error: { fg: c.danger, bg: c.dangerBg, border: c.dangerBorder },
    warn: { fg: c.warn, bg: c.warnBg, border: c.warnBorder },
    ok: { fg: c.ok, bg: c.okBg, border: c.okBorder },
  }[tone];

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border }]}
    >
      <Text style={[styles.text, { color: palette.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  text: { fontSize: 13.5, lineHeight: 20 },
});
