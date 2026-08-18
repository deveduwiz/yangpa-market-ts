/**
 * Hermes의 Intl 지원이 플랫폼·빌드마다 달라서 toLocaleString에 기대지 않고 직접 포맷한다.
 * 웹(fe)의 ko-KR 출력과 같은 모양을 유지하는 게 목표.
 */

/** 1234567 -> "1,234,567원" */
export const won = (n: number | string): string => {
  const value = Number(n);
  if (!Number.isFinite(value)) return '-';
  return `${Math.trunc(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}원`;
};

/** "2026-08-18T..." -> "8월 18일" (목록용) */
export const day = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

/** "2026-08-18T..." -> "2026. 8. 18. 오후 3:04" (상세용) */
export const dateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h24 = d.getHours();
  const ampm = h24 < 12 ? '오전' : '오후';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. ${ampm} ${h}:${mm}`;
};

/** 입력창용. "89000" -> "89,000". 숫자 아닌 문자는 버린다. */
export const commaify = (raw: string): string => {
  const digits = raw.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/** commaify 의 역. "89,000" -> "89000" */
export const uncomma = (value: string): string => value.replace(/[^0-9]/g, '');
