import { useEffect, useState } from 'react';

/**
 * value가 delay(ms) 동안 더 바뀌지 않을 때만 갱신된 값을 돌려준다.
 * 타이핑 한 글자마다 요청이 나가는 걸 막는 용도.
 */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // value가 또 바뀌면 이전 타이머를 버린다 — 이게 디바운스의 핵심
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
