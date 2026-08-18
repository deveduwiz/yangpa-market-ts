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
import { api } from '../api';
import Alert from '../components/Alert';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import type { RootScreenProps } from '../navigation';
import { heading, useColors } from '../theme';

export default function SignUpScreen({ navigation }: RootScreenProps<'SignUp'>) {
  const c = useColors();
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    setError('');

    if (!form.email.trim() || !form.name.trim() || !form.password) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    if (form.password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (form.password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setBusy(true);
    try {
      await api.signUp(form);
      navigation.replace('SignIn', {
        notice: '회원가입이 완료되었습니다. 로그인해 주세요.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
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
        <Card>
          <Text style={[styles.title, heading, { color: c.text }]}>회원가입</Text>

          <Field
            label="이메일"
            value={form.email}
            onChangeText={update('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            maxLength={50}
            placeholder="you@example.com"
          />

          <Field
            label="이름"
            value={form.name}
            onChangeText={update('name')}
            autoComplete="off"
            textContentType="none"
            maxLength={50}
          />

          <Field
            label="비밀번호"
            value={form.password}
            onChangeText={update('password')}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <Field
            label="비밀번호 확인"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />

          {!!error && <Alert message={error} />}

          <Button title={busy ? '처리 중...' : '가입하기'} onPress={onSubmit} busy={busy} />
        </Card>

        <View style={styles.footer}>
          <Text style={{ color: c.text3, fontSize: 13.5 }}>이미 계정이 있으신가요? </Text>
          <Pressable onPress={() => navigation.replace('SignIn')} hitSlop={8}>
            <Text style={[styles.link, { color: c.text }]}>로그인</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48, gap: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 22 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  link: { fontSize: 13.5, fontWeight: '600', textDecorationLine: 'underline' },
});
