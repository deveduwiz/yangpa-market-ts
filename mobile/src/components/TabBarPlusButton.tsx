import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useColors } from '../theme';

/**
 * 등록 탭 버튼.
 */
export default function TabBarPlusButton({
  onPress,
  focused,
}: {
  onPress: () => void;
  focused: boolean;
}) {
  const c = useColors();
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="상품 등록"
        android_ripple={{ color: c.surface2, borderless: true, radius: 28 }}
        style={({ pressed }) => [
          styles.button,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons name={focused ? 'bag-add' : 'bag-add-outline'} size={24} color={focused ? c.text : c.text3} />
        <Text style={[styles.label, { color: focused ? c.text : c.text3 }]}>등록</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
