import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse } from 'lucide-react';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) return setError('Enter your email and password to continue.');
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We couldn’t sign you in. Check your details and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div className="auth-art">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <span className="art-heart"><HeartPulse size={56} strokeWidth={1.5} /></span>
          <span className="art-dot dot-one" /><span className="art-dot dot-two" />
        </div>
        <div className="auth-copy"><span className="eyebrow">A GENTLER WAY TO TRACK</span><h1>Feel more in tune<br />with your health.</h1><p>Your readings, patterns and progress — all in one calm, clear space.</p></div>
        <span className="auth-footer-note">Made for your everyday wellbeing</span>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Brand compact /></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Let’s pick up where<br className="desktop-break" /> you left off.</h2>
          <p className="auth-subtitle">Sign in to your Sweety account.</p>
          {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field"><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label className="field"><span>Password</span><input type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
            <button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowRight size={17} />}</button>
          </form>
          <p className="auth-switch">New to Sweety? <Link to="/signup">Create an account</Link></p>
          <div className="auth-trust"><HeartPulse size={15} /> Your health information stays private to your account.</div>
        </div>
      </section>
    </div>
  );
}
