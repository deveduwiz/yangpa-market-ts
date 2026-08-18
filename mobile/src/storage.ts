import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'yangpa.token';
const VIEW_KEY = 'yangpa.view';

// 웹은 localStorage(동기)지만 RN은 AsyncStorage(비동기)라 전부 Promise가 된다.
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export type ViewMode = 'card' | 'list';

export const getViewMode = async (): Promise<ViewMode> => {
  const saved = await AsyncStorage.getItem(VIEW_KEY);
  return saved === 'list' ? 'list' : 'card';
};

export const setViewMode = (mode: ViewMode) => AsyncStorage.setItem(VIEW_KEY, mode);
