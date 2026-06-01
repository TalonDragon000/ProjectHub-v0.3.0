import React, { useState } from 'react';
import { Target, Zap, Briefcase, Cloud, CloudOff, LogOut, Mail, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function GlobalMenu() {
  const { globalMenuOpen, setGlobalMenuOpen, setQuickNoteOpen, setOnboardingOpen, openWizard } = useApp();
  const { isAuthenticated, isUnlocked, user, signOut, signInWithEmail, signUpWithEmail, signInWithPassword } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  if (!globalMenuOpen) return null;

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    const { error } = await signUpWithEmail(email.trim(), password.trim());
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthMessage('Check your email for the confirmation link.');
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    const { error } = await signInWithPassword(email.trim(), password.trim());
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setShowAuth(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    const { error } = await signInWithEmail(email.trim());
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthMessage('Magic link sent! Check your email.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowAuth(false);
  };

  return (
    <div
      className="absolute inset-0 bg-base/80 backdrop-blur-sm z-10 flex flex-col justify-end items-center pb-28 px-6 animate-in fade-in"
      onClick={() => setGlobalMenuOpen(false)}
    >
      <div className="space-y-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>

        {/* Sync & Backup Section */}
        <div className="bg-surface border border-default rounded-2xl p-4 shadow-lg space-y-3">
          <p className="text-[10px] text-faint uppercase tracking-widest font-bold">Sync & Backup</p>

          {!isAuthenticated && !showAuth && (
            <button
              onClick={() => setShowAuth(true)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-accent-tertiary hover:bg-accent-tertiary/5 py-2.5 rounded-xl transition-colors"
            >
              <Cloud className="w-4 h-4" />
              Sign in to back up
            </button>
          )}

          {!isAuthenticated && showAuth && (
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-raised border border-subtle rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-accent-tertiary transition-colors"
              />
              {authMode === 'signin' || authMode === 'signup' ? (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-raised border border-subtle rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:border-accent-tertiary transition-colors"
                />
              ) : null}

              {authError && (
                <p className="text-xs text-error">{authError}</p>
              )}
              {authMessage && (
                <p className="text-xs text-accent-tertiary">{authMessage}</p>
              )}

              {authMode === 'signup' && (
                <>
                  <button
                    onClick={handleSignUp}
                    disabled={authLoading}
                    className="w-full bg-accent-tertiary text-inverted font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95"
                  >
                    {authLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMessage(''); }}
                    className="w-full text-xs text-muted hover:text-primary transition-colors py-1"
                  >
                    Already have an account? Sign in
                  </button>
                </>
              )}

              {authMode === 'signin' && (
                <>
                  <button
                    onClick={handleSignIn}
                    disabled={authLoading}
                    className="w-full bg-accent-tertiary text-inverted font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95"
                  >
                    {authLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                  <button
                    onClick={() => { setAuthMode('magic'); setAuthError(''); setAuthMessage(''); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-muted hover:text-primary transition-colors py-1"
                  >
                    <Mail className="w-3 h-3" /> Use magic link instead
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }}
                    className="w-full text-xs text-muted hover:text-primary transition-colors py-1"
                  >
                    No account? Create one
                  </button>
                </>
              )}

              {authMode === 'magic' && (
                <>
                  <button
                    onClick={handleMagicLink}
                    disabled={authLoading}
                    className="w-full bg-accent-tertiary text-inverted font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95"
                  >
                    {authLoading ? 'Sending...' : 'Send Magic Link'}
                  </button>
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMessage(''); }}
                    className="w-full text-xs text-muted hover:text-primary transition-colors py-1"
                  >
                    Back to password sign in
                  </button>
                </>
              )}

              {/* Google - coming soon */}
              <div className="flex items-center gap-2 py-2 opacity-50">
                <div className="w-4 h-4 rounded bg-raised flex items-center justify-center">
                  <span className="text-[9px] font-bold text-faint">G</span>
                </div>
                <span className="text-xs text-faint">Google sign-in -- coming soon</span>
              </div>
            </div>
          )}

          {isAuthenticated && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isUnlocked ? (
                  <Cloud className="w-3.5 h-3.5 text-success" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-warning" />
                )}
                <span className="text-xs text-muted truncate flex-1">{user?.email}</span>
              </div>
              {isUnlocked && (
                <p className="text-[10px] text-success flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Encrypted sync active
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-xs text-muted hover:text-error py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <button
          onClick={() => openWizard()}
          className="w-full bg-surface border border-default text-primary font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-primary transition-colors"
        >
          <Target className="text-accent-primary w-5 h-5" />
          <span>New Priority Task</span>
        </button>
        <button
          onClick={() => { setGlobalMenuOpen(false); setQuickNoteOpen(true); }}
          className="w-full bg-surface border border-default text-primary font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-amber transition-colors"
        >
          <Zap className="text-accent-amber w-5 h-5" />
          <span>Quick Note (To Sort)</span>
        </button>
        <button
          onClick={() => { setGlobalMenuOpen(false); setOnboardingOpen(true); }}
          className="w-full bg-surface border border-default text-primary font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-tertiary transition-colors"
        >
          <Briefcase className="text-accent-tertiary w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>
    </div>
  );
}
