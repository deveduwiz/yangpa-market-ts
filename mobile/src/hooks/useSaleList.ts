import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaleListResponse } from '../types';
import type { Sale } from '../types';

const PAGE_SIZE = 12;

type Fetcher = (params: {
  page: number;
  size: number;
  signal: AbortSignal;
}) => Promise<SaleListResponse>;

export type SaleListState = {
  items: Sale[];
  count: number;
  /** 첫 페이지를 불러오는 중 (스켈레톤 표시용) */
  loading: boolean;
  /** 다음 페이지를 이어 붙이는 중 (하단 스피너용) */
  loadingMore: boolean;
  refreshing: boolean;
  error: string;
  hasNext: boolean;
};

/**
 * 홈·찜 목록이 공유하는 무한스크롤 로직.
 *
 * - deps 가 바뀌면 1페이지부터 다시 받는다 (검색어·필터 변경)
 * - 진행 중인 요청은 항상 취소해서, 늦게 온 응답이 최신 결과를 덮어쓰지 않게 한다
 * - 낙관적 갱신(찜 토글, 삭제)을 위해 patch/remove 를 노출한다
 */
export function useSaleList(fetcher: Fetcher, deps: unknown[]) {
  const [state, setState] = useState<SaleListState>({
    items: [],
    count: 0,
    loading: true,
    loadingMore: false,
    refreshing: false,
    error: '',
    hasNext: false,
  });

  const pageRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);
  // setState 업데이터 안에서 요청을 쏘면 StrictMode 가 두 번 부를 때 중복 호출된다.
  // 진행 상태는 ref 로 따로 들고 다닌다.
  const busyRef = useRef(false);
  const hasNextRef = useRef(false);
  // fetcher 는 매 렌더 새로 만들어지므로 ref 로 잡아둔다 (effect 재실행 방지)
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (page: number, mode: 'first' | 'more' | 'refresh') => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    busyRef.current = true;

    setState((prev) => ({
      ...prev,
      loading: mode === 'first',
      loadingMore: mode === 'more',
      refreshing: mode === 'refresh',
      error: mode === 'first' ? '' : prev.error,
    }));

    try {
      const data = await fetcherRef.current({
        page,
        size: PAGE_SIZE,
        signal: controller.signal,
      });
      const fresh = data.documents ?? [];
      const count = data.count ?? 0;
      // be 가 hasNext 를 안 주는 구버전이어도 count 로 계산되게 한다
      const hasNext = data.hasNext ?? page * PAGE_SIZE < count;

      pageRef.current = page;
      hasNextRef.current = hasNext;
      setState((prev) => ({
        items: mode === 'more' ? dedupe([...prev.items, ...fresh]) : fresh,
        count,
        hasNext,
        loading: false,
        loadingMore: false,
        refreshing: false,
        error: '',
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setState((prev) => ({
        ...prev,
        loading: false,
        loadingMore: false,
        refreshing: false,
        error: err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
      }));
    } finally {
      // abort 로 빠져나온 경우엔 다음 요청이 이미 busy 를 다시 세웠으므로
      // 이 컨트롤러가 여전히 최신일 때만 해제한다
      if (abortRef.current === controller) busyRef.current = false;
    }
  }, []);

  // deps 가 바뀌면 처음부터
  useEffect(() => {
    void load(1, 'first');
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    if (busyRef.current || !hasNextRef.current) return;
    void load(pageRef.current + 1, 'more');
  }, [load]);

  const refresh = useCallback(() => {
    void load(1, 'refresh');
  }, [load]);

  /** 서버 왕복 없이 특정 상품만 즉시 갱신 (찜 토글) */
  const patch = useCallback((id: number, changes: Partial<Sale>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    }));
  }, []);

  /** 목록에서 즉시 제거 (삭제, 찜 해제) */
  const remove = useCallback((id: number) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((s) => s.id !== id),
      count: Math.max(0, prev.count - 1),
    }));
  }, []);

  return { ...state, loadMore, refresh, patch, remove, reload: refresh };
}

/** 페이지 경계에서 새 글이 끼어들면 같은 항목이 두 번 올 수 있다 */
function dedupe(items: Sale[]): Sale[] {
  const seen = new Set<number>();
  return items.filter((s) => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}

export { PAGE_SIZE };
