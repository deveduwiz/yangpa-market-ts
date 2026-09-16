import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, imageUrl } from '../api';
import { useAuth } from '../authContext';

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;

export default function SaleDetail() {
  const { id } = useParams();
  const { email: myEmail } = useAuth();
  const [state, setState] = useState({ status: 'loading', sale: null, error: '' });
  const [favoriteState, setFavoriteState] = useState({ isFavorite: false, count: 0 });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api.getSale(id);
        // be의 GET /sales/:id 는 findAll이라 배열로 돌려준다
        const sale = Array.isArray(data.documents)
          ? data.documents[0]
          : data.documents;
        if (!alive) return;
        if (sale) {
          setState({ status: 'done', sale, error: '' });
          setFavoriteState({
            isFavorite: sale.isFavorite ?? false,
            count: sale.favoriteCount ?? 0,
          });
        } else {
          setState({ status: 'error', sale: null, error: '상품을 찾을 수 없습니다.' });
        }
      } catch (err) {
        if (alive) setState({ status: 'error', sale: null, error: err.message });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (state.status === 'loading') return <p className="muted">불러오는 중...</p>;
  if (state.status === 'error')
    return (
      <div className="stack">
        <p className="alert alert--error">{state.error}</p>
        <Link to="/sales" className="btn btn--ghost">
          목록으로
        </Link>
      </div>
    );

  const { sale } = state;
  const isMine = sale && myEmail && sale.email === myEmail;

  const toggleFavorite = async () => {
    const next = !favoriteState.isFavorite;
    setFavoriteState((prev) => ({
      isFavorite: next,
      count: prev.count + (next ? 1 : -1),
    }));
    try {
      await api.setFavorite(sale.id, next);
    } catch {
      setFavoriteState((prev) => ({
        isFavorite: !next,
        count: prev.count + (next ? -1 : 1),
      }));
    }
  };

  return (
    <div className="stack">
      <Link to="/sales" className="link-back">
        ← 목록으로
      </Link>

      <article className="detail">
        <img
          src={imageUrl(sale)}
          alt={sale.productName}
          className="detail__img"
        />
        <div className="detail__body">
          <div className="detail__header">
            <div>
              <h1>{sale.productName}</h1>
              <p className="detail__price">{won(sale.price)}</p>
            </div>
            <button
              type="button"
              className={`detail__heart${favoriteState.isFavorite ? ' detail__heart--active' : ''}`}
              onClick={toggleFavorite}
              aria-label={favoriteState.isFavorite ? '찜 해제' : '찜하기'}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                {favoriteState.isFavorite ? (
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
              <span>{favoriteState.count}</span>
            </button>
          </div>
          <p className="detail__desc">{sale.description}</p>
          <dl className="detail__meta">
            <div>
              <dt>판매자</dt>
              <dd>{sale.sellerName ?? sale.email}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{sale.email}</dd>
            </div>
            <div>
              <dt>등록일</dt>
              <dd>{new Date(sale.createdAt).toLocaleString('ko-KR')}</dd>
            </div>
            <div>
              <dt>관심</dt>
              <dd>{favoriteState.count}명</dd>
            </div>
          </dl>
        </div>
      </article>
    </div>
  );
}
