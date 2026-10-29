import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import PasswordInput from '../components/PasswordInput';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await API.post('/auth/register', { email, password });
      navigate('/login', { state: { notice: response.data.message } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not create your account. Please try again.');
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
          <span className="visual-card-kicker">A FRESH START</span>
          <div className="visual-task"><span className="visual-check">✓</span><span>Find your next small win</span></div>
          <div className="visual-task visual-task-muted"><span className="visual-check" /><span>Build a rhythm that works</span></div>
          <div className="visual-progress"><span /></div>
          <span className="visual-progress-label">Your goals, at your own pace</span>
        </div>
        <div className="auth-visual-copy">
          <p className="eyebrow">A FRESH START</p>
          <h2>Big things begin <span>with one task.</span></h2>
          <p>Create a little space for your ideas, priorities, and progress.</p>
        </div>
        <p className="visual-footer">A calmer way to get things done.</p>
      </section>

      <section className="auth-main">
        <div className="auth-form-wrap">
          <Link className="brand auth-mobile-brand" to="/login">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>taskflow<span className="brand-period">.</span></span>
          </Link>
          <p className="eyebrow">GET STARTED</p>
          <h1>Make it yours.</h1>
          <p className="auth-intro">Create your account and give your goals a home.</p>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <form className="auth-form" onSubmit={handleRegister}>
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
            />
            <PasswordInput
              id="register-password"
              label="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              minLength={12}
              maxLength={72}
              required
            />
            <p className="password-hint">Use 12–72 characters. Longer passphrases are easier to remember.</p>
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <p className="auth-privacy">Your focus deserves a little space.</p>
        </div>
      </section>
    </main>
  );
};

export default Register;
