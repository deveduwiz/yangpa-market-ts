import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import Logo from '../components/Logo';
import { useAuth } from '../authContext';
import type { RootScreenProps } from '../navigation';
import { heading, useColors } from '../theme';

export default function SignInScreen({ navigation, route }: RootScreenProps<'SignIn'>) {
  const c = useColors();
  const { signIn, sessionExpired, clearSessionExpired } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const notice = route.params?.notice;
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    setError('');
    clearSessionExpired();
    setBusy(true);
    try {
      await signIn(form);
      // 로그인에 성공하면 AuthProvider의 isAuthed가 바뀌면서
      // App의 네비게이터가 통째로 상품 스택으로 교체된다 (별도 navigate 불필요)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.brand}>
          <Logo size={34} />
          <Text style={[styles.brandText, heading, { color: c.text }]}>양파마켓</Text>
        </View>

        <Card>
          <Text style={[styles.title, heading, { color: c.text }]}>로그인</Text>

          {sessionExpired && (
            <Alert tone="warn" message="로그인이 만료되었습니다. 다시 로그인해 주세요." />
          )}
          {notice && !sessionExpired && <Alert tone="ok" message={notice} />}

          <Field
            label="이메일"
            value={form.email}
            onChangeText={update('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            placeholder="you@example.com"
            returnKeyType="next"
          />

          <Field
            label="비밀번호"
            value={form.password}
            onChangeText={update('password')}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />

          {!!error && <Alert message={error} />}

          <Button title={busy ? '확인 중...' : '로그인'} onPress={onSubmit} busy={busy} />
        </Card>

        <View style={styles.footer}>
          <Text style={{ color: c.text3, fontSize: 13.5 }}>계정이 없으신가요? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8}>
            <Text style={[styles.link, { color: c.text }]}>회원가입</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48, gap: 20, flexGrow: 1, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: 10, marginBottom: 4 },
  brandText: { fontSize: 21 },
  title: { fontSize: 22 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  link: { fontSize: 13.5, fontWeight: '600', textDecorationLine: 'underline' },
});
