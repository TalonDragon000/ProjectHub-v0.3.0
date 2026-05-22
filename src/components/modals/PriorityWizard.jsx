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
  } = useApp();

  if (!wizardOpen) return null;

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-xl z-50 flex flex-col p-4 animate-in slide-in-from-bottom-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 pt-2">
        <h2 className="text-xl font-bold text-primary flex items-center">
          <Target className="w-5 h-5 mr-2 text-accent-primary" /> Priority Wizard
        </h2>
        <button onClick={() => setWizardOpen(false)} className="text-muted p-2"><X /></button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-24 hide-scrollbar px-2">

        {/* Title & Tags */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Goal Name..."
            value={wizardForm.title}
            onChange={e => setWizardForm({ ...wizardForm, title: e.target.value })}
            className="w-full bg-transparent border-b-2 border-default focus:border-accent-primary outline-none py-2 text-2xl font-bold text-primary transition-colors"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <div>
              <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-1 px-1 block">Quick Tags</label>
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] px-2 py-1 mx-0.5 rounded-full border transition-colors ${wizardForm.tags.includes(tag) ? 'bg-accent-primary border-accent-primary text-inverted' : 'bg-surface border-default text-muted hover:border-strong'}`}
                >
                  + {tag}
                </button>
              ))}

              {wizardForm.tags.filter(t => !QUICK_TAGS.includes(t)).map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="text-[10px] px-2 py-1 rounded-full border bg-accent-primary border-accent-primary text-primary transition-colors"
                >
                  + {tag} ×
                </button>
              ))}

              <div className="flex items-center space-x-1 ml-1 my-2">
                <input
                  type="text"
                  placeholder="Custom tag..."
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customTagInput.trim()) {
                      e.preventDefault();
                      if (!wizardForm.tags.includes(customTagInput.trim())) toggleTag(customTagInput.trim());
                      setCustomTagInput('');
                    }
                  }}
                  className="bg-transparent border-b border-default text-[10px] text-secondary outline-none focus:border-accent-primary w-20 px-1 py-0.5 placeholder:text-faint"
                />
                {customTagInput.trim() && (
                  <button
                    onClick={() => {
                      if (!wizardForm.tags.includes(customTagInput.trim())) toggleTag(customTagInput.trim());
                      setCustomTagInput('');
                    }}
                    className="text-[10px] text-accent-primary font-bold px-1"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Prediction Gauge */}
        <div className="bg-surface p-5 rounded-2xl border border-subtle relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-raised">
            <div
              className={`h-full transition-all duration-500 ${getGaugeColor(predictedColumn)}`}
              style={{ width: `${Math.min((currentScore / 40) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-end mt-2">
            <div>
              <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Calculated Tier</p>
              <p className={`text-xl font-black uppercase ${predictedColumn === 'High' ? 'text-accent-primary' : predictedColumn === 'Med' ? 'text-priority-med' : predictedColumn === 'Later' ? 'text-faint' : 'text-priority-low'}`}>
                {predictedColumn} Priority
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{currentScore}</span>
              <span className="text-xs text-faint ml-1 block">RICE Pts</span>
            </div>
          </div>
        </div>

        {/* MoSCoW Toggles */}
        <div>
          <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-2 block">MoSCoW Filter (Overrides RICE)</label>
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

        {/* RICE Sliders */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 mb-1">
            <label className="text-[10px] text-faint font-bold uppercase tracking-widest block">RICE Estimation (Fibonacci Scale)</label>
            <button
              onClick={() => setWizardForm({ ...wizardForm, infoOpen: wizardForm.infoOpen === 'fibonacci' ? null : 'fibonacci' })}
              className="text-faint hover:text-accent-secondary transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {wizardForm.infoOpen === 'fibonacci' && (
            <div className="mb-2 text-[10px] text-secondary bg-raised p-3 rounded-lg border border-default relative">
              <div className="absolute -top-1 left-[150px] w-2 h-2 bg-raised border-t border-l border-default transform rotate-45" />
              <span className="font-bold text-accent-secondary block mb-0.5">Why jump? (1, 2, 3, 5, 8)</span>
              <span className="text-secondary">As tasks get bigger, they get harder to estimate. This scale removes "false precision". If it feels bigger than a 3, jump to 5 to avoid debating small differences.</span>
            </div>
          )}

          {['reach', 'impact', 'confidence', 'effort'].map(metric => (
            <div key={metric} className="bg-surface p-4 rounded-2xl border border-subtle">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
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
                <div className="mb-4 text-[10px] text-secondary bg-raised p-3 rounded-lg border border-default relative">
                  <div className="absolute -top-1 left-20 w-2 h-2 bg-raised border-t border-l border-default transform rotate-45" />
                  <span className="font-bold text-accent-secondary block mb-0.5">{RICE_HINTS[metric].title}</span>
                  <span className="text-secondary">{RICE_HINTS[metric].desc}</span>
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

      <div className="pt-4 bg-base border-t border-subtle absolute bottom-0 left-0 w-full px-4 pb-safe-bottom z-50">
        <button
          onClick={saveWizard}
          className="w-full bg-gradient-to-r from-accent-primary to-accent-tertiary text-primary font-black text-lg py-4 rounded-2xl shadow-primary active:scale-95 transition-transform mb-4"
        >
          Commit to {predictedColumn} Priority
        </button>
      </div>
    </div>
  );
}
