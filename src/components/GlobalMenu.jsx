import React from 'react';
import { Target, Zap, Briefcase, Cloud, CloudOff, Lock, CircleUser as UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function GlobalMenu() {
  const {
    globalMenuOpen, setGlobalMenuOpen,
    setQuickNoteOpen, setOnboardingOpen,
    setProfileOpen,
    openWizard,
  } = useApp();
  const { isAuthenticated, isUnlocked, isGuest, user } = useAuth();

  if (!globalMenuOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-base/80 backdrop-blur-sm z-10 flex flex-col justify-end items-center pb-28 px-6 animate-in fade-in"
      onClick={() => setGlobalMenuOpen(false)}
    >
      <div className="space-y-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>

        {/* Sync & Account status */}
        <div className="bg-surface border border-default rounded-2xl p-4 shadow-lg">
          <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-3">Sync & Backup</p>

          {isGuest && (
            <button
              onClick={() => { setGlobalMenuOpen(false); setProfileOpen(true); }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-raised transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-amber/10 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-accent-amber" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-primary">Guest mode</p>
                <p className="text-[11px] text-faint">Tap to create an account &amp; back up</p>
              </div>
            </button>
          )}

          {!isGuest && !isAuthenticated && (
            <button
              onClick={() => { setGlobalMenuOpen(false); setProfileOpen(true); }}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-accent-tertiary hover:bg-accent-tertiary/5 py-2.5 rounded-xl transition-colors"
            >
              <Cloud className="w-4 h-4" />
              Sign in to back up
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => { setGlobalMenuOpen(false); setProfileOpen(true); }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-raised transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-raised flex items-center justify-center shrink-0">
                {isUnlocked
                  ? <Cloud className="w-4 h-4 text-success" />
                  : <CloudOff className="w-4 h-4 text-warning" />
                }
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-primary truncate">{user?.email}</p>
                <p className={`text-[11px] flex items-center gap-1 mt-0.5 ${isUnlocked ? 'text-success' : 'text-faint'}`}>
                  {isUnlocked && <Lock className="w-2.5 h-2.5" />}
                  {isUnlocked ? 'Encrypted sync active' : 'Sync locked — tap to manage'}
                </p>
              </div>
              <UserCircle className="w-4 h-4 text-faint shrink-0" />
            </button>
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
