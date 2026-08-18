import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function SaleNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: '',
    description: '',
    price: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // objectURL은 직접 해제해야 누수가 없다
  const pickPhoto = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!photo) {
      setError('상품 사진을 선택해 주세요.');
      return;
    }

    setBusy(true);
    try {
      const data = await api.createSale({ ...form, photo });
      navigate(`/sales/${data.document.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card card--narrow">
      <h1>상품 등록</h1>

      <form onSubmit={onSubmit} className="form">
        <label className="field">
          <span>상품명</span>
          <input
            type="text"
            value={form.productName}
            onChange={update('productName')}
            required
            maxLength={50}
          />
        </label>

        <label className="field">
          <span>설명</span>
          <textarea
            value={form.description}
            onChange={update('description')}
            required
            rows={5}
          />
        </label>

        <label className="field">
          <span>가격 (원)</span>
          <input
            type="number"
            value={form.price}
            onChange={update('price')}
            required
            min={0}
            step={100}
          />
        </label>

        <label className="field">
          <span>상품 사진</span>
          <input
            type="file"
            accept="image/*"
            onChange={pickPhoto}
            required
          />
        </label>

        {preview && (
          <img src={preview} alt="미리보기" className="preview" />
        )}

        {error && <p className="alert alert--error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? '등록 중...' : '등록하기'}
        </button>
      </form>
    </div>
  );
}
