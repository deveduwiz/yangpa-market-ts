import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Muted from '../components/Muted';
import SaleRow from '../components/SaleRow';
import SaleTile from '../components/SaleTile';
import SearchBar from '../components/SearchBar';
import { RowSkeleton, TileSkeleton } from '../components/Skeleton';
import ViewToggle from '../components/ViewToggle';
import { SearchIcon } from '../components/icons';
import { useSaleList } from '../hooks/useSaleList';
import type { TabScreenProps } from '../navigation';
import { getViewMode, setViewMode, type ViewMode } from '../storage';
import { useColors } from '../theme';
import { useDebounced } from '../useDebounced';

const GUTTER = 16;
const GAP = 12;
const SEARCH_DELAY = 300;

export default function HomeScreen({ navigation, route }: TabScreenProps<'Home'>) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);

  const [input, setInput] = useState('');
  const query = useDebounced(input, SEARCH_DELAY).trim();

  const [view, setView] = useState<ViewMode>('card');
  useEffect(() => {
    void getViewMode().then(setView);
  }, []);

  const changeView = (next: ViewMode) => {
    setView(next);
    void setViewMode(next);
  };

  // 상품 등록 후 돌아올 때 refresh 파라미터가 바뀌면 새로고침
  const refreshKey = route.params?.refresh;

  const list = useSaleList(
    ({ page, size, signal }) => api.listSales({ page, size, query: query || undefined, signal }),
    [query, refreshKey],
  );

  // flex:1 을 쓰면 마지막 줄에 타일이 하나만 남았을 때 화면 전체로 늘어난다
  const tileWidth = (width - GUTTER * 2 - GAP) / 2;

  const openDetail = useCallback(
    (id: number, productName: string) => navigation.navigate('SaleDetail', { id, productName }),
    [navigation],
  );

  const isCard = view === 'card';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* 고정 헤더: 검색창 + 보기 모드 토글 */}
      <View style={[styles.stickyHeader, { backgroundColor: c.bg, borderBottomColor: c.border }]}>
        <View style={styles.headRow}>
          <View style={styles.grow}>
            <SearchBar
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onClear={() => {
                setInput('');
                inputRef.current?.focus();
              }}
            />
          </View>
          <ViewToggle value={view} onChange={changeView} />
        </View>
      </View>

      <FlatList
        // numColumns 가 바뀌면 FlatList 를 재마운트해야 한다
        key={view}
        data={list.items}
        keyExtractor={(item) => String(item.id)}
        numColumns={isCard ? 2 : 1}
        columnWrapperStyle={isCard ? styles.column : undefined}
        // 데이터 변경 시 스크롤 위치 유지
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        overScrollMode="never"
        initialNumToRender={10}
        removeClippedSubviews={false}
        renderItem={({ item }) =>
          isCard ? (
            <SaleTile
              sale={item}
              width={tileWidth}
              onPress={() => openDetail(item.id, item.productName)}
              onFavoriteChange={(next) => list.patch(item.id, next)}
            />
          ) : (
            <SaleRow
              sale={item}
              onPress={() => openDetail(item.id, item.productName)}
              onFavoriteChange={(next) => list.patch(item.id, next)}
            />
          )
        }
        contentContainerStyle={[
          styles.content,
          // 탭바에 가려지지 않게 하단 여백을 준다
          { paddingBottom: 24 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
            {!!query && !list.loading && (
              <Muted>{`'${query}' 검색 결과 ${list.count}건`}</Muted>
            )}
            {!!list.error && <Alert message={list.error} />}
          </View>
        }
        ListEmptyComponent={
          list.loading ? (
            <View style={isCard ? styles.skeletonGrid : styles.skeletonList}>
              {Array.from({ length: isCard ? 6 : 5 }).map((_, i) =>
                isCard ? <TileSkeleton key={i} width={tileWidth} /> : <RowSkeleton key={i} />,
              )}
            </View>
          ) : list.error ? null : (
            <EmptyState
              icon={<SearchIcon size={26} color={c.text3} />}
              title={query ? '검색 결과가 없어요' : '아직 등록된 상품이 없어요'}
              description={
                query
                  ? `'${query}'와 일치하는 상품을 찾지 못했습니다.`
                  : '가운데 + 버튼으로 첫 상품을 올려보세요.'
              }
            />
          )
        }
        ListFooterComponent={
          list.loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={c.text3} />
            </View>
          ) : !list.hasNext && list.items.length > 0 ? (
            <View style={styles.footer}>
              <Muted>모든 상품을 다 봤어요</Muted>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: { padding: GUTTER, gap: GAP },
  header: { gap: GAP, marginBottom: 4 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  column: { gap: GAP },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  skeletonList: { gap: GAP },
  footer: { paddingVertical: 20, alignItems: 'center' },
});
