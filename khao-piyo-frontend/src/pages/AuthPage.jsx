import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const messageFor = (err, isLogin) => {
  if (!err.response) return 'Cannot reach the server. Please check your connection and try again.';
  const status = err.response.status;
  // Your backend answers wrong credentials with 401 or 403
  if (isLogin && (status === 400 || status === 401 || status === 403)) return 'Incorrect email or password.';
  if (!isLogin && status === 409) return 'An account with this email already exists.';
  return isLogin
    ? 'Could not sign you in. Please try again.'
    : 'Could not create your account. Please check your details and try again.';
};

const AuthPage = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const { isAuthenticated, login, register } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ''}` : '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in (or just signed in): go back to where the user was heading
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) await login(form.email.trim(), form.password);
      else await register(form.name.trim(), form.email.trim(), form.password);
      // On success isAuthenticated flips and <Navigate> above redirects
    } catch (err) {
      setError(messageFor(err, isLogin));
      setSubmitting(false);
    }
  };

  return (
    <div className="container-x grid place-items-center py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md animate-slide-down space-y-4 rounded-3xl border border-line bg-surface p-8 shadow-xl shadow-ink/5"
      >
        <h1 className="font-display text-3xl font-extrabold">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="text-sm text-muted">
          {from
            ? 'Please sign in to continue.'
            : isLogin
              ? 'Sign in to save your cart and order in a few taps.'
              : 'Sign up to order in a few taps.'}
        </p>

        {!isLogin && (
          <label className="block text-sm font-medium">
            Full name
            <input required name="name" value={form.name} onChange={onChange} className="input mt-1.5" autoComplete="name" />
          </label>
        )}

        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="input mt-1.5"
            autoComplete="email"
          />
        </label>

        <label className="block text-sm font-medium">
          Password
          <div className="relative mt-1.5">
            <input
              required
              minLength={6}
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={onChange}
              className="input pr-11"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-ink/5 hover:text-ink active:scale-90"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full py-3 disabled:pointer-events-none disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Please wait…
            </>
          ) : isLogin ? (
            'Sign in'
          ) : (
            'Sign up'
          )}
        </button>

        <p className="text-center text-sm text-muted">
          {isLogin ? 'New to Khao Piyo?' : 'Already have an account?'}{' '}
          <Link
            to={isLogin ? '/register' : '/login'}
            state={location.state}
            className="font-semibold text-brand hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;