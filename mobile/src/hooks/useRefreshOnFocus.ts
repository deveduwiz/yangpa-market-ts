import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * 화면으로 돌아올 때마다 다시 불러온다.
 * 첫 포커스는 건너뛴다 — 마운트 시점의 최초 요청과 겹쳐 두 번 나가는 걸 막는다.
 */
export function useRefreshOnFocus(refresh: () => void) {
  const skipped = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!skipped.current) {
        skipped.current = true;
        return;
      }
      refresh();
    }, [refresh]),
  );
}
