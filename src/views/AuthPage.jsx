import React, { useState } from 'react';
import { Eye, EyeOff, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function PasswordInput({ value, onChange, placeholder, className, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 text-priority-high shrink-0" />
      <p className="text-xs text-priority-high">{message}</p>
    </div>
  );
}

const INPUT_CLASS =
  'w-full bg-surface border border-default focus:border-accent-tertiary focus:ring-1 focus:ring-accent-tertiary/25 outline-none px-4 py-3.5 text-sm text-primary placeholder:text-faint rounded-xl transition-colors';

export default function AuthPage({ onGuest }) {
  const { signInWithPassword, signUpWithEmail, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const resetForm = (nextMode) => {
    setError('');
    setInfo('');
    setPassword('');
    setConfirmPassword('');
    setMode(nextMode);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await signInWithPassword(email.trim(), password.trim());
    setLoading(false);
    if (err) setError(err.message === 'Invalid login credentials'
      ? 'Incorrect email or password.'
      : err.message);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await signUpWithEmail(email.trim(), password.trim());
    setLoading(false);
    if (err) {
      setError(err.message.includes('already registered')
        ? 'An account with this email already exists. Try signing in.'
        : err.message);
    } else {
      setInfo('Account created! Check your email to confirm, then sign in.');
      resetForm('signin');
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setInfo('Check your email for a password reset link.');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      setGoogleLoading(false);
      setError(err.message);
    }
    // On success, OAuth redirect takes over — no need to clear loading
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-base text-primary flex flex-col font-sans relative overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-8 py-12">

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-2 leading-tight">
            Project Hub
          </h1>
          <p className="text-sm text-muted">
            {mode === 'signup'
              ? 'Create your account to get started.'
              : mode === 'forgot'
              ? 'We\'ll send you a reset link.'
              : 'Sign in to continue.'}
          </p>
        </div>

        {/* Persistent info banner (e.g., after sign-up or forgot password) */}
        {info && (
          <div className="bg-accent-tertiary/10 border border-accent-tertiary/30 rounded-xl px-4 py-3 mb-5 text-xs text-accent-tertiary leading-relaxed">
            {info}
          </div>
        )}

        {/* Email/Password Form */}
        <form
          onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleForgot}
          className="space-y-3"
          noValidate
        >
          <div>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="Email address"
              className={INPUT_CLASS}
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <PasswordInput
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                className={INPUT_CLASS}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <PasswordInput
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Confirm password"
                className={INPUT_CLASS}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && <FieldError message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-tertiary text-inverted font-bold py-3.5 rounded-xl shadow-tertiary transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 mt-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' && (loading ? 'Signing in...' : 'Sign In')}
            {mode === 'signup' && (loading ? 'Creating account...' : 'Create Account')}
            {mode === 'forgot' && (loading ? 'Sending...' : 'Send Reset Link')}
          </button>
        </form>

        {/* Mode switchers */}
        <div className="flex flex-col items-center gap-1 mt-4 text-xs text-muted">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => resetForm('forgot')}
                className="hover:text-primary transition-colors py-1"
              >
                Forgot password?
              </button>
              <button
                onClick={() => resetForm('signup')}
                className="hover:text-primary transition-colors py-1"
              >
                Don't have an account? <span className="font-semibold text-accent-tertiary">Create one</span>
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => resetForm('signin')}
              className="hover:text-primary transition-colors py-1"
            >
              Already have an account? <span className="font-semibold text-accent-tertiary">Sign in</span>
            </button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => resetForm('signin')}
              className="hover:text-primary transition-colors py-1"
            >
              Back to sign in
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-subtle" />
          <span className="text-xs text-faint font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-subtle" />
        </div>

        {/* Social auth */}
        <div className="space-y-2.5">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-default hover:border-strong text-primary font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-95 text-sm"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>
        </div>

        {/* Guest mode */}
        <div className="mt-8 text-center">
          <button
            onClick={onGuest}
            className="text-xs text-faint hover:text-muted transition-colors py-1 underline-offset-2 hover:underline"
            title="Your projects and tasks will only be saved in this browser. Create an account to sync your data across devices."
          >
            Continue without an account
          </button>
          <p className="text-[11px] text-faint mt-1 leading-snug">
            Data is stored locally only and may be lost.
          </p>
        </div>

      </div>
    </div>
  );
}
