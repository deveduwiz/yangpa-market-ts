import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, getToken, setToken, clearToken, setUnauthorizedHandler } from './api';
import { AuthContext } from './authContext';

// jwt.sign({ email }, secret) 이므로 payload에서 email과 exp만 꺼낸다.
// 서명 검증은 서버 몫이고, 여기서는 화면 표시와 만료 예측용으로만 쓴다.
function decode(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// exp는 초 단위. be(REST)는 expiresIn을 안 줘서 없을 수도 있다.
const expiresAt = (token) => {
  const exp = decode(token)?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
};

const isExpired = (token) => {
  const at = expiresAt(token);
  return at !== null && at <= Date.now();
};

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const saved = getToken();
    // 새로고침 시점에 이미 만료됐으면 들고 있지 않는다
    if (saved && isExpired(saved)) {
      clearToken();
      return null;
    }
    return saved;
  });
  const [sessionExpired, setSessionExpired] = useState(false);
  const timerRef = useRef(null);

  const signIn = useCallback(async (credentials) => {
    const data = await api.signIn(credentials);
    setToken(data.token);
    setTokenState(data.token);
    setSessionExpired(false);
    return data;
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setTokenState(null);
    setSessionExpired(false);
  }, []);

  // 만료로 인한 로그아웃. 직접 로그아웃과 달리 안내 문구를 남긴다.
  const expireSession = useCallback(() => {
    clearToken();
    setTokenState((prev) => {
      if (prev) setSessionExpired(true);
      return null;
    });
  }, []);

  // 서버가 401/403을 주는 경우 (위조·서버측 만료)
  useEffect(() => {
    setUnauthorizedHandler(expireSession);
    return () => setUnauthorizedHandler(null);
  }, [expireSession]);

  // exp가 있으면 요청을 기다리지 않고 그 시각에 바로 로그인 화면으로 보낸다
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!token) return;

    const at = expiresAt(token);
    if (at === null) return;

    // setTimeout은 약 24.8일이 상한이라 그 이상은 걸지 않는다
    const delay = at - Date.now();
    if (delay >= 2 ** 31 - 1) return;

    timerRef.current = setTimeout(expireSession, Math.max(0, delay));
    return () => clearTimeout(timerRef.current);
  }, [token, expireSession]);

  const value = useMemo(
    () => ({
      token,
      email: decode(token)?.email ?? null,
      isAuthed: Boolean(token),
      sessionExpired,
      clearSessionExpired: () => setSessionExpired(false),
      signIn,
      signOut,
    }),
    [token, sessionExpired, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
