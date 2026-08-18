import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert as RNAlert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, imageUrl } from '../api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { RowSkeleton, SkeletonBlock } from '../components/Skeleton';
import { TrashIcon, UserIcon } from '../components/icons';
import { useAuth } from '../authContext';
import { day, won } from '../format';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useSaleList } from '../hooks/useSaleList';
import type { TabScreenProps } from '../navigation';
import { heading, radius, useColors } from '../theme';
import type { Me, Sale } from '../types';

export default function MyScreen({ navigation }: TabScreenProps<'My'>) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { email, signOut } = useAuth();

  const confirmSignOut = () =>
    RNAlert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: signOut },
    ]);

  const [me, setMe] = useState<Me | null>(null);
  const [meError, setMeError] = useState('');

  const list = useSaleList(
    ({ page, size, signal }) => api.listSales({ page, size, email, signal }),
    [email],
  );

  // 등록/삭제 후 돌아오면 목록이 최신이어야 한다 (첫 포커스는 건너뜀)
  useRefreshOnFocus(list.refresh);

  // 프로필 카운트도 화면에 들어올 때마다 다시 읽는다
  const loadMe = useCallback(() => {
    const controller = new AbortController();
    api
      .me(controller.signal)
      .then((next) => {
        setMe(next);
        setMeError('');
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setMeError(err instanceof Error ? err.message : '내 정보를 불러오지 못했습니다.');
      });
    return () => controller.abort();
  }, []);

  useFocusEffect(loadMe);

  const confirmDelete = (sale: Sale) =>
    RNAlert.alert('상품 삭제', `'${sale.productName}'을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          // 먼저 목록에서 지우고, 실패하면 되돌린다
          list.remove(sale.id);
          try {
            await api.deleteSale(sale.id);
            setMe((prev) => (prev ? { ...prev, salesCount: Math.max(0, prev.salesCount - 1) } : prev));
          } catch (err) {
            RNAlert.alert('삭제 실패', err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
            list.reload();
          }
        },
      },
    ]);

  const initial = (me?.name ?? email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={list.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('SaleDetail', { id: item.id, productName: item.productName })
            }
            android_ripple={{ color: c.surface2 }}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: c.bg, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Image
              source={{ uri: imageUrl(item.photo) }}
              style={[styles.rowImg, { backgroundColor: c.surface2 }]}
              resizeMode="cover"
            />
            <View style={styles.rowBody}>
              <Text numberOfLines={1} style={[styles.rowTitle, heading, { color: c.text }]}>
                {item.productName}
              </Text>
              <Text style={[styles.rowPrice, { color: c.text }]}>{won(item.price)}</Text>
              <Text style={[styles.rowMeta, { color: c.text3 }]}>
                {day(item.createdAt)} 등록
                {typeof item.favoriteCount === 'number' && item.favoriteCount > 0
                  ? ` · 관심 ${item.favoriteCount}`
                  : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => confirmDelete(item)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`${item.productName} 삭제`}
              android_ripple={{ color: c.surface2, borderless: true, radius: 20 }}
              style={({ pressed }) => [styles.trash, { opacity: pressed ? 0.5 : 1 }]}
            >
              <TrashIcon size={19} color={c.text3} />
            </Pressable>
          </Pressable>
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
            <View style={[styles.profile, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.avatar, { backgroundColor: c.accent }]}>
                {me ? (
                  <Text style={[styles.avatarText, { color: c.accentText }]}>{initial}</Text>
                ) : (
                  <UserIcon size={26} color={c.accentText} filled />
                )}
              </View>

              <View style={styles.profileBody}>
                {me ? (
                  <>
                    <Text style={[styles.name, heading, { color: c.text }]}>{me.name}</Text>
                    <Text style={[styles.email, { color: c.text3 }]}>{me.email}</Text>
                    <Text style={[styles.joined, { color: c.text3 }]}>
                      {day(me.createdAt)} 가입
                    </Text>
                  </>
                ) : (
                  <View style={{ gap: 7 }}>
                    <SkeletonBlock width={110} height={17} />
                    <SkeletonBlock width={160} height={13} />
                    <SkeletonBlock width={90} height={12} />
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.stats, { borderColor: c.border }]}>
              <Stat label="판매" value={me?.salesCount} />
              <View style={[styles.statDivider, { backgroundColor: c.border }]} />
              <Stat label="찜" value={me?.favoritesCount} />
            </View>

            <TouchableOpacity
              onPress={confirmSignOut}
              style={[styles.logoutButton, { borderColor: c.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.logoutText, { color: c.text2 }]}>로그아웃</Text>
            </TouchableOpacity>

            {!!meError && <Alert message={meError} />}

            <Text style={[styles.sectionTitle, heading, { color: c.text }]}>내 판매상품</Text>
            {!!list.error && <Alert message={list.error} />}
          </View>
        }
        ListEmptyComponent={
          list.loading ? (
            <View style={styles.skeleton}>
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </View>
          ) : list.error ? null : (
            <EmptyState
              title="등록한 상품이 없어요"
              description="가운데 + 버튼으로 첫 상품을 올려보세요."
              action={
                <Button
                  title="상품 등록하기"
                  compact
                  onPress={() => navigation.navigate('SaleNew')}
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

function Stat({ label, value }: { label: string; value?: number }) {
  const c = useColors();
  return (
    <View style={styles.stat}>
      {typeof value === 'number' ? (
        <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      ) : (
        <SkeletonBlock width={24} height={22} />
      )}
      <Text style={[styles.statLabel, { color: c.text3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  header: { gap: 16, marginBottom: 4 },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700' },
  profileBody: { flex: 1, gap: 3 },
  name: { fontSize: 17 },
  email: { fontSize: 13 },
  joined: { fontSize: 12 },

  stats: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.md, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 12 },
  statDivider: { width: StyleSheet.hairlineWidth },

  logoutButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '500' },

  sectionTitle: { fontSize: 16, marginTop: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  rowImg: { width: 66, height: 66, borderRadius: radius.sm },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15 },
  rowPrice: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 12 },
  trash: { padding: 6 },

  skeleton: { gap: 12 },
  footer: { paddingVertical: 20, alignItems: 'center' },
});
