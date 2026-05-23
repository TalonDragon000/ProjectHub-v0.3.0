import React from 'react';
import { Home, LayoutList, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function BottomNav() {
  const { activeTab, setActiveTab, globalMenuOpen, setGlobalMenuOpen } = useApp();

  return (
    <nav className="absolute bottom-0 w-full bg-surface border-t border-subtle pb-safe pt-2 px-8 flex justify-between items-center z-20 shadow-nav">
      <button
        onClick={() => { setActiveTab('home'); setGlobalMenuOpen(false); }}
        className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'home' ? 'text-accent-secondary' : 'text-faint'}`}
      >
        <Home className="w-6 h-6 mb-1" />
        <span className="text-[9px] uppercase font-bold tracking-widest">Home</span>
      </button>

      <div className="relative -top-6">
        <button
          onClick={() => setGlobalMenuOpen(!globalMenuOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-inverted text-2xl border-4 border-surface transition-all duration-300 ${globalMenuOpen ? 'bg-overlay rotate-45 shadow-lg text-primary' : 'bg-gradient-to-br from-accent-primary to-accent-tertiary shadow-dock-btn active:scale-95'}`}
        >
          {globalMenuOpen ? <X /> : <Plus />}
        </button>
      </div>

      <button
        onClick={() => { setActiveTab('tasks'); setGlobalMenuOpen(false); }}
        className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'tasks' ? 'text-accent-primary' : 'text-faint'}`}
      >
        <LayoutList className="w-6 h-6 mb-1" />
        <span className="text-[9px] uppercase font-bold tracking-widest">Tasks</span>
      </button>
    </nav>
  );
}
