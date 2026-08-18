import { StyleSheet, Text, View } from 'react-native';
import { heading, useColors } from '../theme';

/** 목록이 비었을 때. 제목 한 줄 + 설명 한 줄 + (선택) 액션. */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      {icon && <View style={[styles.icon, { backgroundColor: c.surface2 }]}>{icon}</View>}
      <Text style={[styles.title, heading, { color: c.text }]}>{title}</Text>
      {!!description && (
        <Text style={[styles.desc, { color: c.text3 }]}>{description}</Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, gap: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 16 },
  desc: { fontSize: 13.5, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 12 },
});
