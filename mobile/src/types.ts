export type Sale = {
  id: number;
  email: string;
  productName: string;
  description: string;
  price: number;
  photo: string;
  createdAt: string;
  updatedAt?: string;
  /** be 가 user 를 조인해서 내려준다. 구버전 응답 대비로 optional. */
  sellerName?: string | null;
  isFavorite?: boolean;
  favoriteCount?: number;
};

export type SaleListResponse = {
  count: number;
  documents: Sale[];
  /** 무한스크롤용. 없으면 count 로 계산한다. */
  hasNext?: boolean;
  page?: number;
  size?: number;
};

export type SaleDetailResponse = {
  documents: Sale | Sale[];
};

export type SignInResponse = {
  token: string;
  message?: string;
};

export type Me = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  salesCount: number;
  favoritesCount: number;
};

export type FavoriteResponse = {
  isFavorite: boolean;
  favoriteCount: number;
};

export type PickedPhoto = {
  uri: string;
  name: string;
  type: string;
};
