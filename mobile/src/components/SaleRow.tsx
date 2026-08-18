import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { imageUrl } from '../api';
import { day, won } from '../format';
import { heading, radius, useColors } from '../theme';
import type { Sale } from '../types';
import HeartButton from './HeartButton';

/** 목록형 한 줄 */
export default function SaleRow({
  sale,
  onPress,
  onFavoriteChange,
}: {
  sale: Sale;
  onPress: () => void;
  onFavoriteChange: (next: { isFavorite: boolean; favoriteCount: number }) => void;
}) {
  const c = useColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${sale.productName} ${won(sale.price)}`}
      android_ripple={{ color: c.surface2 }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bg, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Image
        source={{ uri: imageUrl(sale.photo) }}
        style={[styles.img, { backgroundColor: c.surface2 }]}
        resizeMode="cover"
      />

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, heading, { color: c.text }]}>
          {sale.productName}
        </Text>
        <Text numberOfLines={2} style={[styles.desc, { color: c.text2 }]}>
          {sale.description}
        </Text>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={[styles.metaText, { color: c.text3, flexShrink: 1 }]}>
            {sale.sellerName ?? sale.email}
          </Text>
          <View style={[styles.dot, { backgroundColor: c.text3 }]} />
          <Text style={[styles.metaText, { color: c.text3 }]}>{day(sale.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.price, { color: c.text }]}>{won(sale.price)}</Text>
        <HeartButton
          variant="plain"
          size={18}
          saleId={sale.id}
          isFavorite={Boolean(sale.isFavorite)}
          favoriteCount={sale.favoriteCount}
          onChange={onFavoriteChange}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  img: { width: 78, height: 78, borderRadius: radius.sm },
  body: { flex: 1, gap: 3 },
  title: { fontSize: 15 },
  desc: { fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  right: { alignItems: 'flex-end', gap: 8 },
  price: { fontSize: 15, fontWeight: '600' },
});
