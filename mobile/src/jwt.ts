const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Hermes에 atob가 없는 빌드도 있어서 base64url 디코더를 직접 둔다. */
function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');

  let bits = 0;
  let acc = 0;
  const bytes: number[] = [];

  for (const ch of clean) {
    const idx = B64.indexOf(ch);
    if (idx === -1) continue;
    acc = (acc << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 0xff);
    }
  }

  // JWT payload는 UTF-8 JSON이므로 퍼센트 인코딩을 거쳐 복원한다
  const percent = bytes.map((b) => `%${b.toString(16).padStart(2, '0')}`).join('');
  try {
    return decodeURIComponent(percent);
  } catch {
    return String.fromCharCode(...bytes);
  }
}

export type JwtPayload = { email?: string; exp?: number };

/**
 * be는 jwt.sign({ email }, secret) 이므로 payload에서 email과 exp만 꺼낸다.
 * 서명 검증은 서버 몫이고, 여기서는 화면 표시와 만료 예측용으로만 쓴다.
 */
export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/** exp는 초 단위. be가 expiresIn을 안 주면 없을 수도 있다. */
export const expiresAt = (token: string | null): number | null => {
  const exp = decodeJwt(token)?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
};

export const isExpired = (token: string | null): boolean => {
  const at = expiresAt(token);
  return at !== null && at <= Date.now();
};
