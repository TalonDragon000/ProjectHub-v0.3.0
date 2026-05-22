import React from 'react';
import { Target, Zap, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function GlobalMenu() {
  const { globalMenuOpen, setGlobalMenuOpen, setQuickNoteOpen, setOnboardingOpen, openWizard } = useApp();

  if (!globalMenuOpen) return null;

  return (
    <div className="absolute inset-0 bg-base/80 backdrop-blur-sm z-10 flex flex-col justify-end items-center pb-28 px-6 animate-in fade-in">
      <div className="space-y-4 w-full max-w-xs">
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
