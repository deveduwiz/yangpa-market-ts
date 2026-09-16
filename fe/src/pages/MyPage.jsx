import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl } from '../api';
import { useAuth } from '../authContext';

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
const day = (d) =>
  new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function MyPage() {
  const { email, signOut } = useAuth();
  const [me, setMe] = useState(null);
  const [mySales, setMySales] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const [meData, salesData] = await Promise.all([
          api.me(controller.signal),
          api.listSales({ email, size: 100, signal: controller.signal }),
        ]);
        setMe(meData);
        setMySales(salesData.documents ?? []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      }
    })();

    return () => controller.abort();
  }, [email]);

  const handleDelete = async (sale) => {
    if (!window.confirm(`'${sale.productName}'을(를) 삭제할까요?`)) return;
    try {
      await api.deleteSale(sale.id);
      setMySales((prev) => prev.filter((s) => s.id !== sale.id));
      setMe((prev) => prev ? { ...prev, salesCount: Math.max(0, prev.salesCount - 1) } : prev);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignOut = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      signOut();
    }
  };

  return (
    <div className="stack">
      <h1>마이페이지</h1>

      {error && <p className="alert alert--error">{error}</p>}

      {me && (
        <div className="card profile-card">
          <div className="profile-card__avatar">
            {me.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-card__info">
            <h2 className="profile-card__name">{me.name}</h2>
            <p className="profile-card__email">{me.email}</p>
            <p className="profile-card__joined">{day(me.createdAt)} 가입</p>
          </div>
        </div>
      )}

      {me && (
        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-box__value">{me.salesCount}</span>
            <span className="stat-box__label">판매</span>
          </div>
          <div className="stat-box">
            <span className="stat-box__value">{me.favoritesCount}</span>
            <span className="stat-box__label">찜</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={handleSignOut}
      >
        로그아웃
      </button>

      <h2>내 판매상품</h2>

      {mySales.length === 0 ? (
        <p className="muted">등록한 상품이 없습니다.</p>
      ) : (
        <ul className="rows">
          {mySales.map((sale) => (
            <li key={sale.id} className="row-wrap">
              <Link to={`/sales/${sale.id}`} className="row">
                <img
                  src={imageUrl(sale)}
                  alt={sale.productName}
                  className="row__img"
                  loading="lazy"
                />
                <div className="row__body">
                  <h3 className="row__title">{sale.productName}</h3>
                  <p className="row__meta">
                    {day(sale.createdAt)} 등록
                    {sale.favoriteCount > 0 && ` · 관심 ${sale.favoriteCount}`}
                  </p>
                </div>
                <p className="row__price">{won(sale.price)}</p>
              </Link>
              <button
                type="button"
                className="row__delete"
                onClick={() => handleDelete(sale)}
                aria-label={`${sale.productName} 삭제`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
