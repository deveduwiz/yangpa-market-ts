import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import Muted from '../components/Muted';
import SaleRow from '../components/SaleRow';
import { RowSkeleton } from '../components/Skeleton';
import { HeartIcon } from '../components/icons';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSaleList } from '../hooks/useSaleList';
import type { TabScreenProps } from '../navigation';
import { useColors } from '../theme';

export default function FavoritesScreen({ navigation }: TabScreenProps<'Favorites'>) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const list = useSaleList(
    ({ page, size, signal }) => api.listFavorites({ page, size, signal }),
    [],
  );

  // 홈에서 찜하고 이 탭으로 넘어오면 바로 반영돼야 한다
  useRefreshOnFocus(list.refresh);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <SaleRow
            sale={item}
            onPress={() =>
              navigation.navigate('SaleDetail', { id: item.id, productName: item.productName })
            }
            onFavoriteChange={(next) => {
              // 찜 목록에서 하트를 끄면 그 자리에서 사라지는 게 자연스럽다
              if (next.isFavorite) list.patch(item.id, next);
              else list.remove(item.id);
            }}
          />
        )}
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={list.refresh}
            tintColor={c.text3}
            colors={[c.text]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {!list.loading && list.count > 0 && <Muted>{`찜한 상품 ${list.count}개`}</Muted>}
            {!!list.error && <Alert message={list.error} />}
          </View>
        }
        ListEmptyComponent={
          list.loading ? (
            <View style={styles.skeleton}>
              {Array.from({ length: 5 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </View>
          ) : list.error ? null : (
            <EmptyState
              icon={<HeartIcon size={26} color={c.text3} hollowColor={c.surface2} />}
              title="찜한 상품이 없어요"
              description={'마음에 드는 상품의 하트를 눌러\n여기에 모아보세요.'}
              action={
                <Button
                  title="상품 둘러보기"
                  variant="ghost"
                  compact
                  onPress={() => navigation.navigate('Home')}
                />
              }
            />
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={c.text3} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  header: { gap: 12 },
  skeleton: { gap: 12 },
  footer: { paddingVertical: 20, alignItems: 'center' },
});
