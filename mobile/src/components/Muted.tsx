import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useColors } from '../theme';

/** 웹의 .muted */
export default function Muted({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const c = useColors();
  return <Text style={[styles.text, { color: c.text3 }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 13.5, lineHeight: 20 },
});
