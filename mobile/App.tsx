import { ActivityIndicator, Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/AuthProvider';
import { useAuth } from './src/authContext';
import TabNavigator from './src/navigators/TabNavigator';
import type { RootStackParamList } from './src/navigation';
import SaleDetailScreen from './src/screens/SaleDetailScreen';
import SaleNewScreen from './src/screens/SaleNewScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { darkColors, lightColors, useColors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function navTheme(dark: boolean): Theme {
  const c = dark ? darkColors : lightColors;
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: c.accent,
      background: c.bg,
      card: c.bg,
      text: c.text,
      border: c.border,
      notification: c.danger,
    },
  };
}

/**
 * 웹의 <RequireAuth>는 라우트마다 감쌌지만, RN에서는 스택 자체를 갈아끼운다.
 * 로그아웃되면 상품 화면들이 네비게이터에서 사라지므로 뒤로가기로도 못 돌아온다.
 *
 * SaleDetail·SaleNew 는 탭 밖(루트 스택)에 둔다 — 그래야 열릴 때 탭바가 가려진다.
 */
function RootNavigator() {
  const c = useColors();
  const { isAuthed, restoring } = useAuth();

  if (restoring) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}
      >
        <ActivityIndicator color={c.text3} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: c.text },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: c.bg },
      }}
    >
      {isAuthed ? (
        <Stack.Group>
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="SaleDetail"
            component={SaleDetailScreen}
            options={({ route }) => ({ title: route.params.productName ?? '상품' })}
          />
          <Stack.Screen
            name="SaleNew"
            component={SaleNewScreen}
            options={({ navigation }) => ({
              title: '상품 등록',
              headerTitleAlign: 'center',
              // iOS 는 아래에서 올라오는 시트, 안드로이드는 전체화면 전환으로 매핑된다
              presentation: 'modal',
              // 시트를 아래로 쓸어내려 닫을 수 있게
              gestureEnabled: true,
              ...(Platform.OS === 'android' ? { animation: 'slide_from_bottom' as const } : null),
              headerLeft: () => (
                <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
                  <Text style={{ fontSize: 16, color: lightColors.accent }}>취소</Text>
                </Pressable>
              ),
            })}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: '회원가입' }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={navTheme(dark)}>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
