import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, imageUrl } from '../api';

const PAGE_SIZE = 10;

const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;

export default function Favorites() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const [state, setState] = useState({
    status: 'loading',
    items: [],
    count: 0,
    error: '',
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const data = await api.listFavorites({
          page,
          size: PAGE_SIZE,
          signal: controller.signal,
        });
        setState({
          status: 'done',
          items: data.documents ?? [],
          count: data.count ?? 0,
          error: '',
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setState({ status: 'error', items: [], count: 0, error: err.message });
      }
    })();

    return () => controller.abort();
  }, [page]);

  const setPage = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(next));
    setSearchParams(params);
  };

  const handleUnfavorite = async (id) => {
    try {
      await api.setFavorite(id, false);
      setState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        count: prev.count - 1,
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const lastPage = Math.max(1, Math.ceil(state.count / PAGE_SIZE));

  return (
    <div className="stack">
      <div className="list-head">
        <h1>찜한 상품</h1>
      </div>

      {state.status === 'loading' && <p className="muted">불러오는 중...</p>}

      {state.status === 'error' && (
        <p className="alert alert--error">{state.error}</p>
      )}

      {state.status === 'done' && state.items.length === 0 && (
        <p className="muted">찜한 상품이 없습니다.</p>
      )}

      {state.items.length > 0 && (
        <ul className="grid">
          {state.items.map((sale) => (
            <li key={sale.id} className="tile-wrap">
              <Link to={`/sales/${sale.id}`} className="tile">
                <img
                  src={imageUrl(sale)}
                  alt={sale.productName}
                  className="tile__img"
                  loading="lazy"
                />
                <div className="tile__body">
                  <h2 className="tile__title">{sale.productName}</h2>
                  <p className="tile__price">{won(sale.price)}</p>
                  <p className="tile__meta">{sale.sellerName ?? sale.email}</p>
                </div>
              </Link>
              <button
                type="button"
                className="tile__heart tile__heart--active"
                onClick={() => handleUnfavorite(sale.id)}
                aria-label="찜 해제"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {sale.favoriteCount > 0 && <span>{sale.favoriteCount}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {state.count > PAGE_SIZE && (
        <nav className="pager">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            이전
          </button>
          <span className="muted">
            {page} / {lastPage}
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setPage(page + 1)}
            disabled={page >= lastPage}
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
