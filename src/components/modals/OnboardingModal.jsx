import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function OnboardingModal() {
  const {
    onboardingOpen, setOnboardingOpen,
    projectForm, setProjectForm,
    createProject, loadDemoProject,
    projects,
  } = useApp();

  if (!onboardingOpen) return null;

  const isFirstRun = projects.length === 0;

  return (
    <div className="absolute inset-0 bg-base z-50 flex flex-col justify-center p-8 animate-in zoom-in-95">

      <div className="text-center mb-8">
        {isFirstRun ? (
          <>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-3 leading-tight">
              Project Hub
            </h1>
            <p className="text-muted text-sm leading-relaxed">
              Prioritize ruthlessly. Ship what matters.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-2">
              New Project
            </h2>
            <p className="text-muted text-sm">A 10-second start to maintain focus.</p>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-faint uppercase tracking-widest ml-1 mb-1 block">
            Project Name
          </label>
          <input
            type="text"
            value={projectForm.name}
            onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && createProject()}
            placeholder="e.g. DeFi Wallet"
            autoFocus={isFirstRun}
            className="w-full bg-surface border-b-2 border-default focus:border-accent-tertiary outline-none px-3 py-4 text-xl text-primary rounded-t-xl transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-faint uppercase tracking-widest ml-1 mb-1 block">
            Core Mission <span className="normal-case font-normal">(one sentence)</span>
          </label>
          <input
            type="text"
            value={projectForm.mission}
            onChange={e => setProjectForm({ ...projectForm, mission: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && createProject()}
            placeholder="Why are we building this?"
            className="w-full bg-surface border-b-2 border-default focus:border-accent-tertiary outline-none px-3 py-4 text-lg text-primary rounded-t-xl transition-colors"
          />
        </div>

        <button
          onClick={createProject}
          disabled={!projectForm.name.trim()}
          className="w-full bg-accent-tertiary text-inverted font-bold py-4 rounded-xl mt-4 shadow-tertiary active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Start Building
        </button>

        {isFirstRun && (
          <button
            onClick={loadDemoProject}
            className="w-full text-faint text-sm py-2 hover:text-muted transition-colors"
          >
            or explore the Demo Project first
          </button>
        )}

        {!isFirstRun && (
          <button
            onClick={() => setOnboardingOpen(false)}
            className="w-full text-faint text-sm py-2"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
