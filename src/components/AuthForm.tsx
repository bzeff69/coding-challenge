import { useState } from 'react';
import { isApiRequestError } from '../api/client';

interface AuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
}

export function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Username and password are required.');
      return;
    }

    if (mode === 'register') {
      if (trimmedUsername.length < 3 || trimmedUsername.length > 32) {
        setError('Username must be between 3 and 32 characters.');
        return;
      }

      if (trimmedPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }

      if (trimmedPassword !== confirmPassword.trim()) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      if (mode === 'login') {
        await onLogin(trimmedUsername, trimmedPassword);
      } else {
        await onRegister(trimmedUsername, trimmedPassword);
      }
    } catch (submitError) {
      if (isApiRequestError(submitError)) {
        setError(submitError.message);
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-stone-200 dark:border-stone-800">
          <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${mode === 'login' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${mode === 'register' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-50 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            {mode === 'login' ? 'Welcome back.' : 'Claim your streak.'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {mode === 'login'
              ? 'Log in to reach your habits, stats, and sarcastic feedback.'
              : 'Create an account so your habits stay attached to you instead of the void.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <label className="block mb-1 text-sm font-medium text-stone-600 dark:text-stone-400">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="you_but_consistent"
            autoFocus
            autoComplete={mode === 'login' ? 'username' : 'new-username'}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg mb-4 text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />

          <label className="block mb-1 text-sm font-medium text-stone-600 dark:text-stone-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="At least 8 characters"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />

          {mode === 'register' && (
            <>
              <label className="block mt-4 mb-1 text-sm font-medium text-stone-600 dark:text-stone-400">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full mt-6 px-5 py-2.5 text-white rounded-lg transition-colors font-medium ${submitting ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {submitting
              ? 'Working...'
              : mode === 'login'
                ? 'Log In'
                : 'Create Account'}
          </button>

          <p className="text-xs text-stone-400 dark:text-stone-500 mt-4 leading-5">
            {mode === 'login'
              ? 'Use the account that owns your habits. The roast is personalized now.'
              : 'Usernames accept letters, numbers, dashes, and underscores.'}
          </p>
        </form>
      </div>
    </div>
  );
}
