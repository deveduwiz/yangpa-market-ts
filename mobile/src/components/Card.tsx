import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radius, shadow, useColors } from '../theme';

/** 웹의 .card — 폼 화면을 감싸는 박스 */
export default function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.bg, borderColor: c.border },
        shadow(c, 'sm'),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 24,
    gap: 18,
  },
});
