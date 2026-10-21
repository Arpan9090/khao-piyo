import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      const status = err.response?.status;
      setError(
        !err.response
          ? 'Cannot reach the server. Check that the backend is running.'
          : [400, 401, 403].includes(status)
            ? 'Incorrect email or password.'
            : 'Could not sign you in. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 p-4 dark:bg-gray-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red-600 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white">Khao Piyo Admin</h1>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">Sign in with your admin account.</p>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Email
          <input required type="email" name="email" value={form.email} onChange={onChange} autoComplete="email" className={inputClass} />
        </label>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Password
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:pointer-events-none disabled:opacity-70"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default Login;