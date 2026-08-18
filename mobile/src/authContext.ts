import { createContext, useContext } from 'react';

export type AuthValue = {
  token: string | null;
  email: string | null;
  isAuthed: boolean;
  /** AsyncStorage에서 토큰을 읽어오는 동안 true */
  restoring: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
