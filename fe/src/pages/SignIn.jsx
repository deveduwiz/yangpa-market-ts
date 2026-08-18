import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext';

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, sessionExpired, clearSessionExpired } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const notice = location.state?.notice;
  const from = location.state?.from ?? '/sales';

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    clearSessionExpired();
    setBusy(true);
    try {
      await signIn(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card card--narrow">
      <h1>로그인</h1>

      {sessionExpired && (
        <p className="alert alert--warn">
          로그인이 만료되었습니다. 다시 로그인해 주세요.
        </p>
      )}
      {notice && !sessionExpired && <p className="alert alert--ok">{notice}</p>}

      <form onSubmit={onSubmit} className="form">
        <label className="field">
          <span>이메일</span>
          <input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={update('password')}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="alert alert--error">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? '확인 중...' : '로그인'}
        </button>
      </form>

      <p className="muted">
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}
