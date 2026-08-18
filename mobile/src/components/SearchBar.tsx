import { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, useColors } from '../theme';

/** 돋보기 — 원 + 손잡이 */
function SearchIcon({ color }: { color: string }) {
  return (
    <View style={styles.icon}>
      <View style={[styles.lens, { borderColor: color }]} />
      <View style={[styles.handle, { backgroundColor: color }]} />
    </View>
  );
}

const SearchBar = forwardRef<
  TextInput,
  { value: string; onChangeText: (v: string) => void; onClear: () => void }
>(function SearchBar({ value, onChangeText, onClear }, ref) {
  const c = useColors();

  return (
    <View style={[styles.wrap, { borderColor: c.borderStrong, backgroundColor: c.surface }]}>
      <SearchIcon color={c.text3} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder="상품명으로 검색"
        placeholderTextColor={c.text3}
        accessibilityLabel="상품명 검색"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={[styles.input, { color: c.text }]}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
          style={[styles.clear, { backgroundColor: c.surface2 }]}
        >
          <Text style={[styles.clearText, { color: c.text2 }]}>×</Text>
        </Pressable>
      )}
    </View>
  );
});

export default SearchBar;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 11 },
  icon: { width: 17, height: 17 },
  lens: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 12,
    height: 12,
    borderWidth: 1.6,
    borderRadius: 6,
  },
  handle: {
    position: 'absolute',
    right: 0.5,
    bottom: 1.5,
    width: 5.5,
    height: 1.7,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  clear: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: { fontSize: 15, lineHeight: 18, fontWeight: '500' },
});
