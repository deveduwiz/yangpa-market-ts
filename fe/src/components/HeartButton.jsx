import { useState } from 'react';
import { api } from '../api';

export default function HeartButton({ saleId, isFavorite, count = 0, onToggle }) {
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(isFavorite);
  const [localCount, setLocalCount] = useState(count);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !active;
    setBusy(true);
    setActive(next);
    setLocalCount((prev) => prev + (next ? 1 : -1));

    try {
      await api.setFavorite(saleId, next);
      onToggle?.(next);
    } catch {
      setActive(!next);
      setLocalCount((prev) => prev + (next ? -1 : 1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`tile__heart${active ? ' tile__heart--active' : ''}`}
      onClick={handleClick}
      aria-label={active ? '찜 해제' : '찜하기'}
    >
      <svg viewBox="0 0 24 24" width="18" height="18">
        {active ? (
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        ) : (
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        )}
      </svg>
      {localCount > 0 && <span>{localCount}</span>}
    </button>
  );
}
