import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post('/auth/login', { email, password });
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not sign you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link className="brand auth-brand" to="/login">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>taskflow<span className="brand-period">.</span></span>
        </Link>
        <div className="visual-orbit orbit-one" />
        <div className="visual-orbit orbit-two" />
        <div className="visual-card">
          <span className="visual-card-kicker">TODAY'S FOCUS</span>
          <div className="visual-task"><span className="visual-check">✓</span><span>Make meaningful progress</span></div>
          <div className="visual-task visual-task-muted"><span className="visual-check" /><span>One thing at a time</span></div>
          <div className="visual-progress"><span /></div>
          <span className="visual-progress-label">A little progress goes a long way</span>
        </div>
        <div className="auth-visual-copy">
          <p className="eyebrow">FOCUS ON WHAT MATTERS</p>
          <h2>Make your next move <span>your best one.</span></h2>
          <p>Less overwhelm. More momentum. Your work, thoughtfully organized.</p>
        </div>
        <p className="visual-footer">A calmer way to get things done.</p>
      </section>

      <section className="auth-main">
        <div className="auth-form-wrap">
          <Link className="brand auth-mobile-brand" to="/login">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>taskflow<span className="brand-period">.</span></span>
          </Link>
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Good to see you.</h1>
          <p className="auth-intro">Sign in and pick up right where you left off.</p>

          {location.state?.notice && <p className="auth-notice" role="status">{location.state.notice}</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}

          <form className="auth-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
            />
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="auth-switch">New to taskflow? <Link to="/register">Create an account</Link></p>
          <p className="auth-privacy">Your focus deserves a little space.</p>
        </div>
      </section>
    </main>
  );
};

export default Login;
