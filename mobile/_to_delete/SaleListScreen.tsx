import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { api, imageUrl } from '../api';
import { useAuth } from '../authContext';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Muted from '../components/Muted';
import SearchBar from '../components/SearchBar';
import ViewToggle from '../components/ViewToggle';
import { day, won } from '../format';
import type { ScreenProps } from '../navigation';
import { getViewMode, setViewMode, type ViewMode } from '../storage';
import { heading, radius, shadow, useColors } from '../theme';
import type { Sale } from '../types';
import { useDebounced } from '../useDebounced';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

type State = {
  status: 'loading' | 'done' | 'error';
  items: Sale[];
  count: number;
  error: string;
};

const GUTTER = 16;
const GAP = 12;

export default function SaleListScreen({ navigation }: ScreenProps<'SaleList'>) {
  const c = useColors();
  const { width } = useWindowDimensions();
  // flex:1 을 쓰면 마지막 줄에 타일이 하나만 남았을 때 화면 전체로 늘어난다.
  const tileWidth = (width - GUTTER * 2 - GAP) / 2;
  const { email: myEmail } = useAuth();
  const inputRef = useRef<TextInput>(null);

  // 웹은 URL 쿼리스트링이 검색 상태였지만, 모바일은 화면 로컬 state로 둔다.
  const [page, setPage] = useState(1);
  const [mine, setMine] = useState(false);
  const [input, setInput] = useState('');
  const query = useDebounced(input, SEARCH_DELAY);

  // 보기 방식은 취향이므로 AsyncStorage에 남긴다
  const [view, setView] = useState<ViewMode>('card');
  useEffect(() => {
    void getViewMode().then(setView);
  }, []);

  const changeView = (next: ViewMode) => {
    setView(next);
    void setViewMode(next);
  };

  // 검색어나 필터가 바뀌면 1페이지로 되돌린다
  useEffect(() => {
    setPage(1);
  }, [query, mine]);

  const [state, setState] = useState<State>({
    status: 'loading',
    items: [],
    count: 0,
    error: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const data = await api.listSales({
          page,
          size: PAGE_SIZE,
          email: mine ? myEmail : undefined,
          productName: query.trim() || undefined,
          signal: controller.signal,
        });
        setState({
          status: 'done',
          items: data.documents ?? [],
          count: data.count ?? 0,
          error: '',
        });
      } catch (err) {
        // 다음 요청이 시작돼 취소된 경우는 에러가 아니다
        if (err instanceof Error && err.name === 'AbortError') return;
        setState({
          status: 'error',
          items: [],
          count: 0,
          error: err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
        });
      } finally {
        setRefreshing(false);
      }
    })();

    // 이전 요청을 취소해야 늦게 도착한 응답이 최신 결과를 덮어쓰지 않는다
    return () => controller.abort();
  }, [page, mine, myEmail, query, reloadKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  }, []);

  const openDetail = (sale: Sale) =>
    navigation.navigate('SaleDetail', { id: sale.id, productName: sale.productName });

  const lastPage = Math.max(1, Math.ceil(state.count / PAGE_SIZE));

  const renderCard = (sale: Sale) => (
    <Pressable
      onPress={() => openDetail(sale)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tile,
        {
          width: tileWidth,
          backgroundColor: c.bg,
          borderColor: c.border,
          opacity: pressed ? 0.7 : 1,
        },
        shadow(c, 'sm'),
      ]}
    >
      <Image
        source={{ uri: imageUrl(sale.photo) }}
        style={[styles.tileImg, { backgroundColor: c.surface2 }]}
        resizeMode="cover"
        accessibilityLabel={sale.productName}
      />
      <View style={styles.tileBody}>
        <Text numberOfLines={1} style={[styles.tileTitle, heading, { color: c.text }]}>
          {sale.productName}
        </Text>
        <Text style={[styles.tilePrice, { color: c.text }]}>{won(sale.price)}</Text>
        <Text numberOfLines={1} style={[styles.meta, { color: c.text3 }]}>
          {sale.email}
        </Text>
      </View>
    </Pressable>
  );

  const renderRow = (sale: Sale) => (
    <Pressable
      onPress={() => openDetail(sale)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: c.bg, borderColor: c.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Image
        source={{ uri: imageUrl(sale.photo) }}
        style={[styles.rowImg, { backgroundColor: c.surface2 }]}
        resizeMode="cover"
        accessibilityLabel={sale.productName}
      />
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={[styles.rowTitle, heading, { color: c.text }]}>
          {sale.productName}
        </Text>
        <Text numberOfLines={2} style={[styles.rowDesc, { color: c.text2 }]}>
          {sale.description}
        </Text>
        <View style={styles.rowMeta}>
          <Text numberOfLines={1} style={[styles.meta, { color: c.text3, flexShrink: 1 }]}>
            {sale.email}
          </Text>
          <View style={[styles.dot, { backgroundColor: c.text3 }]} />
          <Text style={[styles.meta, { color: c.text3 }]}>{day(sale.createdAt)}</Text>
        </View>
      </View>
      <Text style={[styles.rowPrice, { color: c.text }]}>{won(sale.price)}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        // key를 바꿔야 numColumns 변경 시 FlatList가 재마운트된다
        key={view}
        data={state.items}
        keyExtractor={(item) => String(item.id)}
        numColumns={view === 'card' ? 2 : 1}
        columnWrapperStyle={view === 'card' ? styles.column : undefined}
        renderItem={({ item }) => (view === 'card' ? renderCard(item) : renderRow(item))}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.text3} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headActions}>
              <ViewToggle value={view} onChange={changeView} />
              <Button
                title="내 상품만"
                variant="ghost"
                compact
                active={mine}
                onPress={() => setMine((v) => !v)}
              />
              <Button
                title="상품 등록"
                compact
                onPress={() => navigation.navigate('SaleNew')}
                style={styles.grow}
              />
            </View>

            <SearchBar
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onClear={() => {
                setInput('');
                inputRef.current?.focus();
              }}
            />

            {!!query.trim() && state.status === 'done' && (
              <Muted>{`‘${query.trim()}’ 검색 결과 ${state.count}건`}</Muted>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {state.status === 'loading' && !refreshing && (
              <ActivityIndicator color={c.text3} />
            )}
            {state.status === 'error' && <Alert message={state.error} />}
            {state.status === 'done' && (
              <Muted>
                {query.trim()
                  ? `'${query.trim()}'와 일치하는 상품이 없습니다.`
                  : '등록된 상품이 없습니다.'}
              </Muted>
            )}
          </View>
        }
        ListFooterComponent={
          state.count > PAGE_SIZE ? (
            <View style={styles.pager}>
              <Button
                title="이전"
                variant="ghost"
                compact
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Muted>{`${page} / ${lastPage}`}</Muted>
              <Button
                title="다음"
                variant="ghost"
                compact
                disabled={page >= lastPage}
                onPress={() => setPage((p) => Math.min(lastPage, p + 1))}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: GUTTER, paddingBottom: 40, gap: GAP },
  header: { gap: 12, marginBottom: 4 },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  column: { gap: GAP },

  tile: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  tileImg: { width: '100%', aspectRatio: 1 },
  tileBody: { padding: 12, gap: 3 },
  tileTitle: { fontSize: 14.5 },
  tilePrice: { fontSize: 15, fontWeight: '600' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  rowImg: { width: 76, height: 76, borderRadius: radius.sm },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15 },
  rowDesc: { fontSize: 13, lineHeight: 18 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowPrice: { fontSize: 15, fontWeight: '600' },

  meta: { fontSize: 12 },
  dot: { width: 3, height: 3, borderRadius: 1.5 },

  empty: { paddingVertical: 48, alignItems: 'center', gap: 12 },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 16,
  },
});
