const ICONS = {
  card: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  list: (
    <>
      <rect x="3" y="4.5" width="18" height="4" rx="1.5" />
      <rect x="3" y="12" width="18" height="4" rx="1.5" />
      <path d="M3 19.5h18" />
    </>
  ),
};

const LABELS = { card: '카드형 보기', list: '목록형 보기' };

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="viewtoggle" role="group" aria-label="보기 방식">
      {['card', 'list'].map((mode) => (
        <button
          key={mode}
          type="button"
          className={`viewtoggle__btn${value === mode ? ' is-active' : ''}`}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          aria-label={LABELS[mode]}
          title={LABELS[mode]}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICONS[mode]}
          </svg>
        </button>
      ))}
    </div>
  );
}
