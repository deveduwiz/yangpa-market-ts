import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import HeaderAuth from '../components/HeaderAuth';
import HeaderBrand from '../components/HeaderBrand';
import TabBarPlusButton from '../components/TabBarPlusButton';
import { HeartIcon } from '../components/icons';
import type { RootScreenProps, TabParamList } from '../navigation';
import FavoritesScreen from '../screens/FavoritesScreen';
import HomeScreen from '../screens/HomeScreen';
import MyScreen from '../screens/MyScreen';
import { useColors } from '../theme';

const Tab = createBottomTabNavigator<TabParamList>();

/** 등록 탭은 화면이 없다. tabPress 를 가로채 모달을 띄우므로 렌더될 일이 없다. */
function NewPlaceholder() {
  return null;
}

export default function TabNavigator({ navigation }: RootScreenProps<'Tabs'>) {
  const c = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600', color: c.text },
        headerShadowVisible: false,
        // iOS 는 헤더 제목이 가운데, 안드로이드는 왼쪽이 기본이라 왼쪽으로 통일한다
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.text3,
        tabBarStyle: {
          backgroundColor: c.bg,
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          // 안드로이드는 기본 높이가 낮아 아이콘과 라벨이 붙는다
          ...Platform.select({ android: { height: 62, paddingBottom: 8, paddingTop: 6 } }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '홈',
          headerTitle: () => <HeaderBrand />,
          headerRight: () => <HeaderAuth />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: '찜',
          headerTitle: '찜한 상품',
          tabBarIcon: ({ color, focused }) => (
            <HeartIcon size={23} color={color} filled={focused} hollowColor={c.bg} />
          ),
        }}
      />

      <Tab.Screen
        name="NewPlaceholder"
        component={NewPlaceholder}
        options={{
          title: '',
          tabBarButton: (props) => (
            <TabBarPlusButton
              focused={Boolean(props.accessibilityState?.selected)}
              onPress={() => navigation.navigate('SaleNew')}
            />
          ),
        }}
        listeners={{
          // 탭을 눌러도 화면을 바꾸지 않고 모달만 띄운다
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('SaleNew');
          },
        }}
      />

      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{
          title: '마이페이지',
          headerTitle: '마이페이지',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={23} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
