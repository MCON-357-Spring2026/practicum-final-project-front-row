/**
 * Login and sign-up UI.
 * Validates input on the client, then calls the Chapterly auth API.
 */

import { useState } from 'react';

export function AuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please add a display name for sign up.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await onRegister({ email, password, displayName });
      } else {
        await onLogin({ email, password });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-heading">
      <header className="auth-card__hero">
        <p className="brand-mark" aria-hidden="true">
          ✦
        </p>
        <h1 id="auth-heading">Chapterly</h1>
        <p className="muted">
          Document distinct seasons of life — college, dating, and more — in a
          shareable digital scrapbook.
        </p>
      </header>

      <div className="tab-row" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'login'}
          className={mode === 'login' ? 'tab tab--active' : 'tab'}
          onClick={() => setMode('login')}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={mode === 'signup' ? 'tab tab--active' : 'tab'}
          onClick={() => setMode('signup')}
        >
          Sign up
        </button>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <label className="field">
            <span>Display name</span>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Maya Cohen"
            />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={submitting}
        >
          {submitting
            ? 'Please wait…'
            : mode === 'login'
              ? 'Log in'
              : 'Create account'}
        </button>
      </form>
    </section>
  );
}
