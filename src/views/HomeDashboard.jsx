import React from 'react';
import { Target, Zap, CircleCheck as CheckCircle2, Pencil, Plus, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SPECS = [
  { key: 'who', label: 'WHO', hint: 'Audience' },
  { key: 'what', label: 'WHAT', hint: 'Product' },
  { key: 'why', label: 'WHY', hint: 'Problem' },
];

export default function HomeDashboard() {
  const { activeProject, projectTasks, completedTasks, nowTasks, nextTasks, openProjectEdit, setProfileOpen } = useApp();
  const { isGuest } = useAuth();

  const specs = activeProject?.specs || {};

  return (
    <div className="p-4 space-y-8 pb-24">

      {/* Guest mode nudge banner */}
      {isGuest && (
        <button
          onClick={() => setProfileOpen(true)}
          className="w-full flex items-center gap-3 bg-accent-amber/8 border border-accent-amber/25 rounded-2xl px-4 py-3 text-left hover:bg-accent-amber/12 transition-colors"
        >
          <CloudOff className="w-4 h-4 text-accent-amber shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary">Your data is local only</p>
            <p className="text-[11px] text-muted mt-0.5">Create a free account to back up and sync across devices.</p>
          </div>
          <span className="text-[11px] font-semibold text-accent-amber shrink-0">Sign up</span>
        </button>
      )}

      {/* Progress & Mission */}
      <section
        onClick={openProjectEdit}
        className="flex items-center space-x-4 p-4 bg-surface rounded-2xl border border-subtle shadow-lg cursor-pointer hover:border-default transition-colors group"
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-raised"
              strokeWidth="3" stroke="currentColor" fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-accent-secondary"
              strokeDasharray={`${(completedTasks.length / (projectTasks.length || 1)) * 100}, 100`}
              strokeWidth="3" stroke="currentColor" fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent-secondary">
            {Math.round((completedTasks.length / (projectTasks.length || 1)) * 100)}%
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm text-secondary">Mission</h2>
          <p className="text-xs text-muted leading-snug italic">
            "{activeProject?.mission || 'Tap to set a mission statement...'}"
          </p>
        </div>
        <Pencil className="w-3.5 h-3.5 text-faint opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </section>

      {/* Strategy Specs */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-accent-secondary text-xs font-bold uppercase tracking-widest flex items-center">
            <Target className="w-4 h-4 mr-1" /> Strategy Specs
          </h3>
          <button
            onClick={openProjectEdit}
            className="flex items-center gap-1 text-[10px] text-faint hover:text-primary transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SPECS.map(({ key, label, hint }) => {
            const value = specs[key]?.trim();
            return value ? (
              <div
                key={key}
                onClick={openProjectEdit}
                className="bg-surface p-3 rounded-xl border border-subtle cursor-pointer hover:border-default transition-colors"
              >
                <p className="text-[9px] text-faint uppercase tracking-widest font-bold mb-1.5">{label}</p>
                <p className="text-xs text-secondary leading-snug">{value}</p>
              </div>
            ) : (
              <button
                key={key}
                onClick={openProjectEdit}
                className="bg-surface p-3 rounded-xl border border-subtle border-dashed text-center flex flex-col justify-center items-center opacity-60 hover:opacity-90 transition-opacity"
              >
                <span className="text-[10px] text-faint font-bold mb-1">{label}</span>
                <span className="text-[9px] text-faint">{hint}</span>
                <Plus className="w-3.5 h-3.5 text-faint mt-1" />
              </button>
            );
          })}
        </div>
      </section>

      {/* GO Roadmap */}
      <section className="space-y-2">
        <h3 className="text-accent-primary text-xs font-bold uppercase tracking-widest flex items-center">
          <Zap className="w-4 h-4 mr-1" /> GO Roadmap
        </h3>
        <div className="bg-surface rounded-2xl p-4 border border-subtle space-y-4 shadow-lg">
          <div className="border-l-2 border-priority-high pl-4 relative">
            <div className="absolute w-2 h-2 bg-priority-high rounded-full -left-[5px] top-1" />
            <span className="text-xs font-bold text-priority-high uppercase">Now</span>
            {nowTasks.length === 0
              ? <p className="text-xs text-faint italic mt-1">No high priority goals.</p>
              : nowTasks.map(t => <p key={t.id} className="text-sm text-primary mt-1">{t.title}</p>)
            }
          </div>
          <div className="border-l-2 border-priority-med pl-4 relative">
            <div className="absolute w-2 h-2 bg-priority-med rounded-full -left-[5px] top-1" />
            <span className="text-xs font-bold text-priority-med uppercase">Next</span>
            {nextTasks.length === 0
              ? <p className="text-xs text-faint italic mt-1">Empty queue.</p>
              : nextTasks.map(t => <p key={t.id} className="text-sm text-muted mt-1">{t.title}</p>)
            }
          </div>
        </div>
      </section>

      {/* Devlog */}
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-accent-tertiary text-xs font-bold uppercase tracking-widest flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Devlog
          </h3>
        </div>
        <div className="space-y-2">
          {completedTasks.length === 0 && (
            <div className="text-sm text-faint italic p-4 bg-surface rounded-xl border border-subtle text-center">
              <p>Devlog Empty.</p>
              <span className="text-[10px] not-italic">( Complete a task to start the list. )</span>
            </div>
          )}
          {completedTasks.slice().reverse().map(t => (
            <div key={t.id} className="p-3 bg-surface rounded-xl border border-subtle flex justify-between items-center opacity-60">
              <span className="line-through text-muted text-sm">{t.title}</span>
              <span className="text-[10px] bg-priority-med/30 text-priority-med px-2 py-1 rounded border border-priority-med">Done</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
