import React from 'react';
import { Target, X, CircleHelp as HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { getGaugeColor } from '../../lib/colors.js';
import { FIBONACCI, QUICK_TAGS, RICE_HINTS } from '../../constants.js';

export default function PriorityWizard() {
  const {
    wizardOpen, setWizardOpen,
    wizardForm, setWizardForm,
    customTagInput, setCustomTagInput,
    currentScore, predictedColumn,
    saveWizard, toggleTag,
    editingTask,
  } = useApp();

  if (!wizardOpen) return null;

  const isCreating = !editingTask;

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-xl z-50 flex flex-col p-4 animate-in slide-in-from-bottom-full overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Target className="w-5 h-5 text-accent-primary" />
          {isCreating ? 'New Task' : 'Prioritize'}
        </h2>
        <button onClick={() => setWizardOpen(false)} className="text-muted p-2 hover:text-primary transition-colors">
          <X />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pb-24 hide-scrollbar px-1">

        {/* CREATE MODE: title + description + tags */}
        {isCreating && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Task name..."
              value={wizardForm.title}
              onChange={e => setWizardForm({ ...wizardForm, title: e.target.value })}
              autoFocus
              className="w-full bg-transparent border-b-2 border-default focus:border-accent-primary outline-none py-2 text-2xl font-black text-primary transition-colors"
            />
            <textarea
              placeholder="Short description (optional)..."
              value={wizardForm.description || ''}
              onChange={e => setWizardForm({ ...wizardForm, description: e.target.value })}
              rows={2}
              className="w-full bg-transparent border-b border-default focus:border-accent-primary outline-none py-2 text-sm text-secondary placeholder:text-faint transition-colors resize-none"
            />
            <div>
              <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${wizardForm.tags.includes(tag) ? 'bg-accent-primary border-accent-primary text-inverted' : 'bg-surface border-default text-muted hover:border-strong'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODE: read-only task name as context header */}
        {!isCreating && (
          <div className="pb-1 border-b border-subtle">
            <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Task</p>
            <p className="text-lg font-black text-primary leading-snug">{wizardForm.title}</p>
          </div>
        )}

        {/* Live prediction gauge — always shown */}
        <div className="bg-surface p-4 rounded-2xl border border-subtle relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-raised">
            <div
              className={`h-full transition-all duration-500 ${getGaugeColor(predictedColumn)}`}
              style={{ width: `${Math.min((currentScore / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Calculated Tier</p>
              <p className={`text-xl font-black uppercase ${predictedColumn === 'High' ? 'text-priority-high' : predictedColumn === 'Med' ? 'text-priority-med' : predictedColumn === 'Later' ? 'text-faint' : 'text-priority-low'}`}>
                {predictedColumn} Priority
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{currentScore}</span>
              <span className="text-xs text-faint ml-1 block">RICE Pts</span>
            </div>
          </div>
        </div>

        {/* MoSCoW */}
        <div>
          <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-2 block">
            MoSCoW <span className="normal-case font-normal">(overrides RICE tier)</span>
          </label>
          <div className="flex bg-surface rounded-xl p-1 border border-subtle">
            {['Must', 'Should', 'Could', "Won't"].map(m => (
              <button
                key={m}
                onClick={() => setWizardForm({ ...wizardForm, moscow: m })}
                className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${wizardForm.moscow === m ? (m === 'Must' ? 'bg-accent-primary/80 text-inverted' : m === "Won't" ? 'bg-overlay text-secondary' : 'bg-raised text-primary shadow-md') : 'text-faint hover:text-secondary'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* RICE sliders */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-faint font-bold uppercase tracking-widest">RICE — Fibonacci Scale</label>
            <button
              onClick={() => setWizardForm({ ...wizardForm, infoOpen: wizardForm.infoOpen === 'fibonacci' ? null : 'fibonacci' })}
              className="text-faint hover:text-accent-secondary transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {wizardForm.infoOpen === 'fibonacci' && (
            <div className="text-[10px] text-secondary bg-raised p-3 rounded-lg border border-default">
              <span className="font-bold text-accent-secondary block mb-0.5">Why jump? (1, 2, 3, 5, 8)</span>
              <span>As tasks get bigger, they get harder to estimate precisely. The gaps remove false precision — if it feels bigger than a 3, jump to 5.</span>
            </div>
          )}

          {['reach', 'impact', 'confidence', 'effort'].map(metric => (
            <div key={metric} className="bg-surface p-4 rounded-2xl border border-subtle">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-primary capitalize">{metric}</label>
                  <button
                    onClick={() => setWizardForm({ ...wizardForm, infoOpen: wizardForm.infoOpen === metric ? null : metric })}
                    className="text-faint hover:text-accent-secondary transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-accent-secondary font-black text-lg">{wizardForm[metric]}</span>
              </div>

              {wizardForm.infoOpen === metric && (
                <div className="mb-4 text-[10px] text-secondary bg-raised p-3 rounded-lg border border-default">
                  <span className="font-bold text-accent-secondary block mb-0.5">{RICE_HINTS[metric].title}</span>
                  <span>{RICE_HINTS[metric].desc}</span>
                </div>
              )}

              <div className="flex justify-between relative before:absolute before:top-1/2 before:left-4 before:right-4 before:h-0.5 before:bg-raised before:-z-0">
                {FIBONACCI.map(val => (
                  <button
                    key={val}
                    onClick={() => setWizardForm({ ...wizardForm, [metric]: val })}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${wizardForm[metric] === val ? 'bg-accent-secondary text-inverted scale-110 shadow-selected' : 'bg-surface border-2 border-default text-muted hover:border-strong'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 bg-base border-t border-subtle absolute bottom-0 left-0 w-full px-4 pb-safe-bottom z-50">
        <button
          onClick={saveWizard}
          className="w-full bg-gradient-to-r from-accent-primary to-accent-tertiary text-inverted font-black text-lg py-4 rounded-2xl shadow-primary active:scale-95 transition-transform mb-4"
        >
          {isCreating ? `Create at ${predictedColumn} Priority` : `Commit to ${predictedColumn} Priority`}
        </button>
      </div>

    </div>
  );
}