import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** 하단 탭 — 홈 / 찜 / 등록 / 마이 */
export type TabParamList = {
  Home: { refresh?: number } | undefined;
  Favorites: undefined;
  /** 실제로 열리지 않는 자리표시자. tabPress 를 가로채 SaleNew 모달을 띄운다. */
  NewPlaceholder: undefined;
  My: undefined;
};

/**
 * 루트 스택.
 * SaleDetail·SaleNew 를 탭 밖(루트)에 두면 탭바가 자동으로 가려진다.
 */
export type RootStackParamList = {
  SignIn: { notice?: string } | undefined;
  SignUp: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  SaleDetail: { id: number; productName?: string };
  SaleNew: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/** 탭 화면에서도 루트 스택으로 navigate 할 수 있어야 한다 */
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
