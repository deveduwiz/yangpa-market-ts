import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Field from '../components/Field';
import { PlusIcon } from '../components/icons';
import { commaify, uncomma } from '../format';
import type { RootScreenProps } from '../navigation';
import { radius, useColors } from '../theme';
import type { PickedPhoto } from '../types';

/** 확장자로 MIME을 추정한다. 안드로이드에서 mimeType이 비는 경우가 있어서 대비. */
function guessMime(uri: string, fallback?: string | null): string {
  if (fallback) return fallback;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
}

export default function SaleNewScreen({ navigation }: RootScreenProps<'SaleNew'>) {
  const c = useColors();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({ productName: '', description: '', price: '' });
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pickPhoto = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        Platform.OS === 'ios'
          ? '사진 접근 권한이 필요합니다. 설정 > 양파마켓 에서 허용해 주세요.'
          : '사진 접근 권한이 필요합니다. 앱 정보 > 권한 에서 허용해 주세요.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    setPhoto({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      type: guessMime(asset.uri, asset.mimeType),
    });
  };

  const onSubmit = async () => {
    setError('');

    if (!photo) {
      setError('상품 사진을 선택해 주세요.');
      return;
    }
    if (!form.productName.trim() || !form.description.trim()) {
      setError('상품명과 설명을 입력해 주세요.');
      return;
    }
    const price = uncomma(form.price);
    if (!price) {
      setError('가격을 입력해 주세요.');
      return;
    }

    setBusy(true);
    try {
      await api.createSale({
        productName: form.productName.trim(),
        description: form.description.trim(),
        price,
        photo,
      });
      // 모달을 닫고 홈 목록을 새로고침한다
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Tabs',
            params: { screen: 'Home', params: { refresh: Date.now() } },
          },
        ],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* 사진을 맨 위에 크게 — 중고거래 앱의 관례 */}
        <Pressable
          onPress={pickPhoto}
          accessibilityRole="button"
          accessibilityLabel={photo ? '상품 사진 다시 선택' : '상품 사진 선택'}
          android_ripple={{ color: c.surface2 }}
          style={({ pressed }) => [
            styles.picker,
            {
              backgroundColor: photo ? c.surface2 : c.surface,
              borderColor: photo ? 'transparent' : c.borderStrong,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <PlusIcon size={30} color={c.text3} />
              <Text style={[styles.hint, { color: c.text3 }]}>탭해서 사진 선택</Text>
            </View>
          )}
        </Pressable>

        {photo && (
          <Text style={[styles.hint, styles.repick, { color: c.text3 }]}>
            사진을 눌러 다시 선택할 수 있습니다.
          </Text>
        )}

        <View style={styles.form}>
          <Field
            label="상품명"
            value={form.productName}
            onChangeText={update('productName')}
            maxLength={50}
            placeholder="무선 이어폰"
            returnKeyType="next"
          />

          <Field
            label="설명"
            value={form.description}
            onChangeText={update('description')}
            multiline
            placeholder="상품 상태, 구입 시기, 거래 방법 등을 적어주세요."
          />

          <Field
            label="가격"
            value={form.price}
            onChangeText={(v) => update('price')(commaify(v))}
            keyboardType="number-pad"
            placeholder="0"
            returnKeyType="done"
          />

          {!!error && <Alert message={error} />}

          <Button title={busy ? '등록 중...' : '등록하기'} onPress={onSubmit} busy={busy} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 8 },
  picker: {
    marginHorizontal: 20,
    aspectRatio: 4 / 3,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 8 },
  hint: { fontSize: 12.5 },
  repick: { marginTop: 8, marginHorizontal: 20 },
  form: { padding: 20, gap: 18 },
});
