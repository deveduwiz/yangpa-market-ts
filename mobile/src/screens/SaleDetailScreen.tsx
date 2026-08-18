import { useEffect, useState } from 'react';
import {
  Alert as RNAlert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, imageUrl } from '../api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import HeartButton from '../components/HeartButton';
import { SkeletonBlock } from '../components/Skeleton';
import { useAuth } from '../authContext';
import { dateTime, won } from '../format';
import type { RootScreenProps } from '../navigation';
import { heading, radius, useColors } from '../theme';
import type { Sale } from '../types';

type State = { status: 'loading' | 'done' | 'error'; sale: Sale | null; error: string };

export default function SaleDetailScreen({ navigation, route }: RootScreenProps<'SaleDetail'>) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { email: myEmail } = useAuth();
  const { id } = route.params;

  const [state, setState] = useState<State>({ status: 'loading', sale: null, error: '' });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api.getSale(id);
        // be의 GET /sales/:id 는 findAll 이라 배열로 돌려준다
        const sale = Array.isArray(data.documents) ? data.documents[0] : data.documents;
        if (!alive) return;
        setState(
          sale
            ? { status: 'done', sale, error: '' }
            : { status: 'error', sale: null, error: '상품을 찾을 수 없습니다.' },
        );
      } catch (err) {
        if (!alive) return;
        setState({
          status: 'error',
          sale: null,
          error: err instanceof Error ? err.message : '상품을 불러오지 못했습니다.',
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  // 헤더 제목은 목록에서 넘겨받은 이름으로 먼저 채우고, 응답이 오면 교정한다
  useEffect(() => {
    const title = state.sale?.productName ?? route.params.productName;
    if (title) navigation.setOptions({ title });
  }, [navigation, state.sale, route.params.productName]);

  const isMine = Boolean(state.sale && myEmail && state.sale.email === myEmail);

  const confirmDelete = () => {
    if (!state.sale) return;
    RNAlert.alert('상품 삭제', `'${state.sale.productName}'을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteSale(id);
            navigation.goBack();
          } catch (err) {
            RNAlert.alert('삭제 실패', err instanceof Error ? err.message : '잠시 후 다시 시도해 주세요.');
          }
        },
      },
    ]);
  };

  if (state.status === 'loading') {
    const imgSize = width - 32;
    return (
      <ScrollView style={{ backgroundColor: c.bg }} scrollEnabled={false}>
        <View style={styles.imageWrap}>
          <SkeletonBlock width={imgSize} height={imgSize * 0.85} round={radius.md} />
        </View>
        <View style={styles.body}>
          <SkeletonBlock width="70%" height={24} />
          <SkeletonBlock width="40%" height={28} />
          <SkeletonBlock width="100%" height={16} />
          <SkeletonBlock width="90%" height={16} />
        </View>
      </ScrollView>
    );
  }

  if (state.status === 'error' || !state.sale) {
    return (
      <View style={[styles.center, { backgroundColor: c.bg }]}>
        <Alert message={state.error} />
        <Button title="돌아가기" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const sale = state.sale;

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUrl(sale.photo) }}
          style={[styles.image, { backgroundColor: c.surface2 }]}
          resizeMode="cover"
          accessibilityLabel={sale.productName}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleBody}>
            <Text style={[styles.title, heading, { color: c.text }]}>{sale.productName}</Text>
            <Text style={[styles.price, { color: c.text }]}>{won(sale.price)}</Text>
          </View>
          {!isMine && (
            <HeartButton
              variant="plain"
              size={26}
              saleId={sale.id}
              isFavorite={Boolean(sale.isFavorite)}
              favoriteCount={sale.favoriteCount}
              onChange={(next) => setState((prev) => ({ ...prev, sale: { ...sale, ...next } }))}
            />
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <Text style={[styles.desc, { color: c.text2 }]}>{sale.description}</Text>

        <View style={[styles.metaBox, { backgroundColor: c.surface, borderColor: c.border }]}>
          <MetaRow label="판매자" value={sale.sellerName ?? sale.email} />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <MetaRow label="이메일" value={sale.email} />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <MetaRow label="등록일" value={dateTime(sale.createdAt)} />
          {typeof sale.favoriteCount === 'number' && (
            <>
              <View style={[styles.divider, { backgroundColor: c.border }]} />
              <MetaRow label="관심" value={`${sale.favoriteCount}명`} />
            </>
          )}
        </View>

        {isMine && (
          <Button title="이 상품 삭제하기" variant="ghost" onPress={confirmDelete} />
        )}
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <View style={styles.metaRow}>
      <Text style={[styles.metaKey, { color: c.text3 }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20 },
  imageWrap: { paddingHorizontal: 16, paddingTop: 16 },
  image: { width: '100%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' },
  body: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titleBody: { flex: 1, gap: 6 },
  title: { fontSize: 22 },
  price: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6 },
  divider: { height: StyleSheet.hairlineWidth },
  desc: { fontSize: 15, lineHeight: 24 },
  metaBox: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, gap: 12 },
  metaKey: { fontSize: 13 },
  metaValue: { fontSize: 13.5, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
});
