/**
 * Login and sign-up UI.
 * Validates input on the client; credentials are not sent to a server yet.
 */

import { useState } from 'react';

export function AuthForm({ onSignIn }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (mode === 'signup' && !displayName.trim()) {
      setError('Please add a display name for sign up.');
      return;
    }

    // Demo auth only — wire to POST /api/auth when the backend is ready.
    onSignIn({
      email,
      displayName: mode === 'signup' ? displayName : email.split('@')[0],
    });
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

        <button type="submit" className="btn btn--primary btn--block">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
