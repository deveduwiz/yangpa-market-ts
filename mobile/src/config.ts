import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = 3000;

/**
 * RN에는 Vite 프록시가 없어서 be의 절대 주소가 필요하다.
 *
 * 1순위: EXPO_PUBLIC_API_BASE_URL (.env 또는 실행 환경변수, Expo가 빌드 시 인라인)
 * 2순위: Metro 번들 URL의 호스트 + :3000
 *        — 개발 PC의 LAN IP가 그대로 들어 있어서 실기기에서도 바로 붙는다.
 * 3순위: 플랫폼별 localhost 대체 주소
 */
function devHost(): string | null {
  const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
  const host = scriptURL?.match(/^[a-z]+:\/\/([^/:]+)/i)?.[1];
  if (!host) return null;
  // 안드로이드 에뮬레이터에서 localhost는 에뮬레이터 자신을 가리킨다
  if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
    return '10.0.2.2';
  }
  return host;
}

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const host = devHost() ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
  return `http://${host}:${DEFAULT_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
