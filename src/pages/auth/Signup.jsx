import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', employeeId: '', role: 'employee' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const user = await signup(form);
      navigate(user.role === 'admin' ? '/admin' : '/employee', { replace: true });
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><span className="brand-mark">D</span><span>Dayflow</span></div><p className="eyebrow">Create workspace access</p><h1>Set up your account</h1><p className="auth-subtitle">Create your secure HRMS profile.</p><form className="auth-form" onSubmit={handleSubmit}>
    <label>Full name<input name="name" value={form.name} onChange={update} autoComplete="name" /></label>
    <label>Email<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" /></label>
    <div className="auth-two-column"><label>Employee ID<input name="employeeId" value={form.employeeId} onChange={update} /></label><label>Role<select name="role" value={form.role} onChange={update}><option value="employee">Employee</option><option value="admin">Admin</option></select></label></div>
    <label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
  </form></section></main>;
}

export default Signup;