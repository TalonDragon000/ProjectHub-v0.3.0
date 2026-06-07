import React from 'react';
import { Folder, CircleUser as UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppHeader() {
  const { activeProject, setVaultOpen, setProfileOpen } = useApp();
  const { isGuest } = useAuth();

  return (
    <header className="Section-AppHeader p-4 border-b border-subtle flex justify-between items-center bg-surface z-10">
      <div onClick={() => setVaultOpen(true)} className="cursor-pointer active:opacity-70 flex items-center space-x-2 flex-1 min-w-0">
        <Folder className="w-5 h-5 text-accent-tertiary shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary leading-tight truncate">
            {activeProject?.name || "Project Hub"}
          </h1>
          <p className="text-[10px] text-muted uppercase tracking-wider font-bold">Tap to open Vault</p>
        </div>
      </div>
      <button
        onClick={() => setProfileOpen(true)}
        className="ml-3 shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative"
        aria-label="Open profile and settings"
      >
        <UserCircle className={`w-5 h-5 transition-colors ${isGuest ? 'text-accent-amber' : 'text-faint hover:text-primary'}`} />
        {isGuest && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-amber border border-surface" />
        )}
      </button>
    </header>
  );
}
