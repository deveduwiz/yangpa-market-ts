import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { imageUrl } from '../api';
import { won } from '../format';
import { heading, radius, shadow, useColors } from '../theme';
import type { Sale } from '../types';
import HeartButton from './HeartButton';

/** 카드형 목록의 한 칸 */
export default function SaleTile({
  sale,
  width,
  onPress,
  onFavoriteChange,
}: {
  sale: Sale;
  width: number;
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
        styles.tile,
        { width, backgroundColor: c.bg, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
        shadow(c, 'sm'),
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
        <Text style={[styles.price, { color: c.text }]}>{won(sale.price)}</Text>
        <Text numberOfLines={1} style={[styles.meta, { color: c.text3 }]}>
          {sale.sellerName ?? sale.email}
        </Text>
      </View>

      <View style={styles.heart}>
        <HeartButton
          saleId={sale.id}
          isFavorite={Boolean(sale.isFavorite)}
          favoriteCount={sale.favoriteCount}
          onChange={onFavoriteChange}
          variant="plain"
          size={22}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  img: { width: '100%', aspectRatio: 1 },
  body: { padding: 12, paddingBottom: 8, gap: 3 },
  heart: { position: 'absolute', right: 8, bottom: 8 },
  title: { fontSize: 14.5 },
  price: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12 },
});
