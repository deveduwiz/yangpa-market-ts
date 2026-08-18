import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { useColors } from '../theme';

/**
 * 홈 헤더 우측의 사용자 이름 표시.
 */
export default function HeaderAuth() {
  const c = useColors();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .me(controller.signal)
      .then((me) => setName(me.name))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  if (!name) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: c.text2 }]}>{name}님</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 6, paddingHorizontal: 4, marginRight: 12 },
  label: { fontSize: 13.5, fontWeight: '500' },
});
