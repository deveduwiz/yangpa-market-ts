import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setBusy(true);
    try {
      await api.signUp(form);
      navigate('/signin', {
        replace: true,
        state: { notice: '회원가입이 완료되었습니다. 로그인해 주세요.' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card card--narrow">
      <h1>회원가입</h1>

      <form onSubmit={onSubmit} className="form">
        <label className="field">
          <span>이메일</span>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            maxLength={50}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>이름</span>
          <input
            type="text"
            value={form.name}
            onChange={update('name')}
            required
            maxLength={50}
            autoComplete="name"
          />
        </label>

        <label className="field">
          <span>비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            required
            minLength={4}
            autoComplete="new-password"
          />
        </label>

        <label className="field">
          <span>비밀번호 확인</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className="alert alert--error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? '처리 중...' : '가입하기'}
        </button>
      </form>

      <p className="muted">
        이미 계정이 있으신가요? <Link to="/signin">로그인</Link>
      </p>
    </div>
  );
}
