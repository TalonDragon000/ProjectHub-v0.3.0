import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const SPECS_CONFIG = [
  { key: 'who', label: 'WHO — Audience', placeholder: 'Who is this project for?' },
  { key: 'what', label: 'WHAT — Product', placeholder: 'What are we building?' },
  { key: 'why', label: 'WHY — Problem', placeholder: 'What problem does this solve?' },
];

export default function ProjectEditModal() {
  const { projectEditOpen, closeProjectEdit, activeProject, updateProject } = useApp();

  const [form, setForm] = useState({ name: '', mission: '', specs: { who: '', what: '', why: '' } });

  useEffect(() => {
    if (activeProject) {
      setForm({
        name: activeProject.name || '',
        mission: activeProject.mission || '',
        specs: { who: '', what: '', why: '', ...(activeProject.specs || {}) },
      });
    }
  }, [activeProject, projectEditOpen]);

  if (!projectEditOpen || !activeProject) return null;

  const handleSpecChange = (key, value) => {
    setForm(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateProject({ ...activeProject, ...form });
    closeProjectEdit();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-xl animate-in slide-in-from-bottom-full overflow-hidden">

      <div className="h-1 w-full bg-accent-tertiary/70" />

      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border bg-accent-tertiary/20 text-accent-tertiary border-accent-tertiary/50">
          Project Settings
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs font-bold text-accent-secondary px-3 py-1.5 rounded-lg bg-accent-secondary/20 border border-accent-secondary/40 hover:bg-accent-secondary/30 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={closeProjectEdit} className="text-muted p-2 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">

        {/* Project name */}
        <div className="space-y-3">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Project name..."
            autoFocus
            className="w-full bg-transparent border-b-2 border-default focus:border-accent-primary outline-none py-2 text-2xl font-black text-primary transition-colors"
          />
          <textarea
            value={form.mission}
            onChange={e => setForm({ ...form, mission: e.target.value })}
            placeholder="Mission statement — what does this project aim to accomplish?"
            rows={3}
            className="w-full bg-transparent border-b border-default focus:border-accent-primary outline-none py-2 text-sm text-secondary placeholder:text-faint transition-colors resize-none"
          />
        </div>

        <div className="border-t border-subtle" />

        {/* Strategy Specs */}
        <div>
          <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-3 block">Strategy Specs</label>
          <div className="space-y-2">
            {SPECS_CONFIG.map(({ key, label, placeholder }) => (
              <div key={key} className="bg-surface rounded-xl p-3 border border-subtle focus-within:border-accent-primary transition-colors">
                <p className="text-[9px] text-faint uppercase tracking-widest font-bold mb-1.5">{label}</p>
                <textarea
                  value={form.specs[key] || ''}
                  onChange={e => handleSpecChange(key, e.target.value)}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full bg-transparent text-xs text-secondary placeholder:text-faint outline-none resize-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
