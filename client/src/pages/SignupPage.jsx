import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse } from 'lucide-react';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export default function SignupPage() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Your password must be at least 8 characters.');
    setLoading(true);
    try {
      await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/login', { replace: true, state: { message: 'Your account is ready. Sign in to get started.' } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'We couldn’t create your account. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div className="auth-art signup-art"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><span className="art-heart"><HeartPulse size={56} strokeWidth={1.5} /></span><span className="art-dot dot-one" /><span className="art-dot dot-two" /></div>
        <div className="auth-copy"><span className="eyebrow">SMALL STEPS, REAL INSIGHT</span><h1>Care that fits<br />into your day.</h1><p>Build a clearer picture of your glucose, one simple check-in at a time.</p></div>
        <span className="auth-footer-note">Made for your everyday wellbeing</span>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Brand compact /></div>
          <span className="eyebrow">GET STARTED</span>
          <h2>Your wellbeing<br className="desktop-break" /> starts here.</h2>
          <p className="auth-subtitle">Create your personal Sweety space.</p>
          {location.state?.message && <div className="alert alert-success" role="status">{location.state.message}</div>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field"><span>Your name</span><input type="text" autoComplete="name" placeholder="Alex Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label className="field"><span>Email address</span><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
            <label className="field"><span>Password</span><input type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
            <button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'} {!loading && <ArrowRight size={17} />}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <div className="auth-trust"><HeartPulse size={15} /> Your health information stays private to your account.</div>
        </div>
      </section>
    </div>
  );
}
