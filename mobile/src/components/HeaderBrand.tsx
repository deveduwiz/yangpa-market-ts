import { StyleSheet, Text, View } from 'react-native';
import Logo from './Logo';
import { heading, useColors } from '../theme';

export default function HeaderBrand() {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <Logo size={22} />
      <Text style={[styles.text, heading, { color: c.text }]}>양파마켓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 17 },
});
