import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) return setError('Enter your email and password.');
    try {
      setSubmitting(true);
      setError('');
      const user = await login(form.email, form.password);
      const destination = location.state?.from?.pathname;
      navigate(destination || (user.role === 'admin' ? '/admin' : '/employee'), { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to your Dayflow workspace.">
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" /></label>
      <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" /></label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
      <p className="auth-switch">New to Dayflow? <Link to="/signup">Create an account</Link></p>
    </form>
  </AuthLayout>;
}

function AuthLayout({ title, subtitle, children }) {
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><span className="brand-mark">D</span><span>Dayflow</span></div><p className="eyebrow">HRMS workspace</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section></main>;
}

export default Login;