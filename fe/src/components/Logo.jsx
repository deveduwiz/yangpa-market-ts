// 양파 마크. currentColor를 쓰므로 라이트/다크 모두에서 자동으로 대비가 맞는다.
export default function Logo({ size = 32, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="양파마켓"
    >
      {/* 싹 */}
      <path d="M12 6.4c.2-1.8 1.5-3.2 3.4-3.6" />
      <path d="M12 6.4c-.5-1.5-1.8-2.5-3.4-2.7" />

      {/* 겉껍질 */}
      <path d="M12 6.2c4.9 3 6.6 6.9 4.9 10.1-1.1 2-3 2.9-4.9 2.9s-3.8-.9-4.9-2.9C5.4 13.1 7.1 9.2 12 6.2Z" />

      {/* 속켜 */}
      <path d="M12 9.9c2 1.9 2.7 4.2 1.8 6-.4.8-1.1 1.2-1.8 1.2s-1.4-.4-1.8-1.2c-.9-1.8-.2-4.1 1.8-6Z" />
    </svg>
  );
}
