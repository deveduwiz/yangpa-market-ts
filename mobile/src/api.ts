// be의 라우터와 1:1로 대응하는 얇은 fetch 래퍼.
import { API_BASE_URL } from './config';
import { getToken } from './storage';
import type {
  FavoriteResponse,
  Me,
  PickedPhoto,
  SaleDetailResponse,
  SaleListResponse,
  SignInResponse,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// 토큰 만료/위조로 서버가 401·403을 주면 AuthProvider가 등록한 핸들러를 부른다.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  { method = 'GET', body, auth = false, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // FormData면 Content-Type을 직접 지정하지 않는다.
  // RN 네트워킹이 multipart boundary를 붙여야 multer가 파싱할 수 있다.
  const isFormData = body instanceof FormData;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    signal,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // 에러 핸들러가 JSON을 못 주는 경우 대비
  }

  if (!res.ok) {
    // be의 authorization 미들웨어는 토큰이 없으면 401, 유효하지 않으면 403을 준다
    if (auth && (res.status === 401 || res.status === 403)) onUnauthorized?.();
    throw new ApiError(data?.message ?? `요청 실패 (${res.status})`, res.status);
  }
  return data as T;
}

type ListParams = {
  page?: number;
  size?: number;
  email?: string | null;
  query?: string;
  signal?: AbortSignal;
};

export const api = {
  signUp: (payload: { email: string; name: string; password: string }) =>
    request<{ message?: string }>('/members/sign-up', { method: 'POST', body: payload }),

  signIn: (payload: { email: string; password: string }) =>
    request<SignInResponse>('/members/sign-in', { method: 'POST', body: payload }),

  /** 토큰에는 email 뿐이라 이름·가입일·카운트는 여기서 받아온다 */
  me: (signal?: AbortSignal) =>
    request<{ member: Me }>('/members/me', { auth: true, signal }).then((r) => r.member),

  // be: app.use('/sales', auth, salesRouter) — 조회에도 토큰이 필요하다
  listSales: ({ page = 1, size = 10, email, query, signal }: ListParams = {}) => {
    const qs = new URLSearchParams({ page: String(page), size: String(size) });
    if (email) qs.set('email', email);
    if (query) qs.set('query', query);
    return request<SaleListResponse>(`/sales?${qs.toString()}`, { auth: true, signal });
  },

  listFavorites: ({ page = 1, size = 10, signal }: ListParams = {}) => {
    const qs = new URLSearchParams({ page: String(page), size: String(size) });
    return request<SaleListResponse>(`/sales/favorites?${qs.toString()}`, { auth: true, signal });
  },

  getSale: (id: number | string) =>
    request<SaleDetailResponse>(`/sales/${id}`, { auth: true }),

  createSale: async ({
    productName,
    description,
    price,
    photo,
  }: {
    productName: string;
    description: string;
    price: string;
    photo: PickedPhoto;
  }) => {
    // Expo SDK 57: fetch로 blob을 만들어 FormData에 추가
    const response = await fetch(photo.uri);
    const blob = await response.blob();

    const form = new FormData();
    form.append('productName', productName);
    form.append('description', description);
    form.append('price', price);
    form.append('photo', blob, photo.name);

    return request<{ document: { id: number } }>('/sales', {
      method: 'POST',
      body: form,
      auth: true,
    });
  },

  deleteSale: (id: number) =>
    request<{ message?: string }>(`/sales/${id}`, { method: 'DELETE', auth: true }),

  /** 찜 토글. be 쪽이 멱등이라 중복 호출해도 안전하다. */
  setFavorite: (id: number, next: boolean) =>
    request<FavoriteResponse>(`/sales/${id}/favorite`, {
      method: next ? 'POST' : 'DELETE',
      auth: true,
    }),
};

export const imageUrl = (filename?: string | null) =>
  filename ? `${API_BASE_URL}/image/${encodeURIComponent(filename)}` : '';
