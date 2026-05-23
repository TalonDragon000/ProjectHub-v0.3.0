import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { QUICK_TAGS } from '../../constants.js';

const SPECS_CONFIG = [
  { key: 'who', label: 'WHO — Audience', placeholder: 'Who is this task for?' },
  { key: 'what', label: 'WHAT — Product', placeholder: 'What are we building or changing?' },
  { key: 'why', label: 'WHY — Problem', placeholder: 'What problem does this solve?' },
];

export default function TaskEditModal({ task, onCancel, onSave }) {
  const { updateTask } = useApp();

  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    tags: [...(task.tags || [])],
    specs: { who: '', what: '', why: '', ...(task.specs || {}) },
  });
  const [customTagInput, setCustomTagInput] = useState('');

  const handleToggleTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSpecChange = (key, value) => {
    setForm(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    updateTask({ ...task, ...form });
    onSave();
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-xl animate-in slide-in-from-bottom-full overflow-hidden">

      <div className="h-1 w-full bg-accent-secondary/70" />

      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50">
          Editing
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs font-bold text-accent-secondary px-3 py-1.5 rounded-lg bg-accent-secondary/20 border border-accent-secondary/40 hover:bg-accent-secondary/30 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={onCancel} className="text-muted p-2 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">

        {/* Title + description */}
        <div className="space-y-3">
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Task title..."
            autoFocus
            className="w-full bg-transparent border-b-2 border-default focus:border-accent-primary outline-none py-2 text-2xl font-black text-primary transition-colors"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Short description (optional)..."
            rows={3}
            className="w-full bg-transparent border-b border-default focus:border-accent-primary outline-none py-2 text-sm text-secondary placeholder:text-faint transition-colors resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-[10px] text-faint font-bold uppercase tracking-widest mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${form.tags.includes(tag) ? 'bg-accent-primary border-accent-primary text-inverted' : 'bg-surface border-default text-muted hover:border-strong'}`}
              >
                {tag}
              </button>
            ))}
            {form.tags.filter(t => !QUICK_TAGS.includes(t)).map(tag => (
              <button key={tag} onClick={() => handleToggleTag(tag)} className="text-[10px] px-2 py-1 rounded-full border bg-accent-primary border-accent-primary text-inverted">
                {tag} ×
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Custom tag..."
              value={customTagInput}
              onChange={e => setCustomTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customTagInput.trim()) {
                  e.preventDefault();
                  handleToggleTag(customTagInput.trim());
                  setCustomTagInput('');
                }
              }}
              className="bg-transparent border-b border-default text-[10px] text-secondary outline-none focus:border-accent-primary w-28 px-1 py-0.5 placeholder:text-faint"
            />
            {customTagInput.trim() && (
              <button onClick={() => { handleToggleTag(customTagInput.trim()); setCustomTagInput(''); }} className="text-[10px] text-accent-primary font-bold">
                Add
              </button>
            )}
          </div>
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