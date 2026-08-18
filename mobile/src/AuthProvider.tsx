import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, setUnauthorizedHandler } from './api';
import { AuthContext, type AuthValue } from './authContext';
import { decodeJwt, expiresAt, isExpired } from './jwt';
import { clearToken, getToken, setToken } from './storage';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 앱 시작 시 저장된 토큰 복원. 이미 만료됐으면 들고 있지 않는다.
  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await getToken();
      if (saved && isExpired(saved)) await clearToken();
      if (!alive) return;
      setTokenState(saved && !isExpired(saved) ? saved : null);
      setRestoring(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: { email: string; password: string }) => {
    const data = await api.signIn(credentials);
    await setToken(data.token);
    setTokenState(data.token);
    setSessionExpired(false);
  }, []);

  const signOut = useCallback(() => {
    void clearToken();
    setTokenState(null);
    setSessionExpired(false);
  }, []);

  // 만료로 인한 로그아웃. 직접 로그아웃과 달리 안내 문구를 남긴다.
  const expireSession = useCallback(() => {
    void clearToken();
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
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!token) return;

    const at = expiresAt(token);
    if (at === null) return;

    // setTimeout은 약 24.8일이 상한이라 그 이상은 걸지 않는다
    const delay = at - Date.now();
    if (delay >= 2 ** 31 - 1) return;

    timerRef.current = setTimeout(expireSession, Math.max(0, delay));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, expireSession]);

  const value = useMemo<AuthValue>(
    () => ({
      token,
      email: decodeJwt(token)?.email ?? null,
      isAuthed: Boolean(token),
      restoring,
      sessionExpired,
      clearSessionExpired: () => setSessionExpired(false),
      signIn,
      signOut,
    }),
    [token, restoring, sessionExpired, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
