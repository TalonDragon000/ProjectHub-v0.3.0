import React, { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { getGaugeColor } from '../../lib/colors.js';
import { calculateScore } from '../../lib/rice.js';
import TaskEditModal from './TaskEditModal.jsx';

const MOSCOW_COLOR = {
  Must: 'bg-accent-primary/20 text-accent-primary border-accent-primary/50',
  Should: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50',
  Could: 'bg-raised text-muted border-default',
  "Won't": 'bg-overlay text-faint border-default',
};

const METRIC_LABELS = {
  reach: 'Reach', impact: 'Impact', confidence: 'Confidence', effort: 'Effort',
};

const SPECS = [
  { key: 'who', label: 'WHO', hint: 'Audience' },
  { key: 'what', label: 'WHAT', hint: 'Product' },
  { key: 'why', label: 'WHY', hint: 'Problem' },
];

export default function TaskViewModal() {
  const { viewTaskOpen, viewingTask, closeViewTask, openWizard } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  if (!viewTaskOpen || !viewingTask) {
    if (isEditing) setIsEditing(false);
    return null;
  }

  if (isEditing) {
    return <TaskEditModal task={viewingTask} onCancel={() => setIsEditing(false)} onSave={() => setIsEditing(false)} />;
  }

  const t = viewingTask;
  const score = calculateScore(t.reach, t.impact, t.confidence, t.effort);
  const gaugeWidth = `${Math.min((parseFloat(score) / 40) * 100, 100)}%`;
  const hasAnySpec = SPECS.some(s => t.specs?.[s.key]?.trim());

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-xl animate-in slide-in-from-bottom-full overflow-hidden">

      <div className={`h-1 w-full ${getGaugeColor(t.column)}`} />

      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${MOSCOW_COLOR[t.moscow] || 'bg-raised text-muted border-default'}`}>
          {t.moscow}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-raised transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={closeViewTask} className="text-muted p-2 hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">

        <div>
          <h2 className="text-2xl font-black text-primary leading-tight">{t.title}</h2>
          {t.description && (
            <p className="mt-2 text-sm text-secondary leading-relaxed">{t.description}</p>
          )}
        </div>

        {t.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {t.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-raised text-muted px-2 py-0.5 rounded-full border border-default">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Strategy Specs */}
        <div>
          <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-3">Strategy Specs</p>
          <div className="grid grid-cols-3 gap-2">
            {SPECS.map(({ key, label, hint }) => {
              const value = t.specs?.[key]?.trim();
              return value ? (
                <div key={key} className="bg-surface rounded-xl p-3 border border-subtle">
                  <p className="text-[9px] text-faint uppercase tracking-widest font-bold mb-1.5">{label}</p>
                  <p className="text-xs text-secondary leading-snug">{value}</p>
                </div>
              ) : (
                <button
                  key={key}
                  onClick={() => setIsEditing(true)}
                  className="bg-surface rounded-xl p-3 border border-subtle border-dashed flex flex-col items-center justify-center gap-1 opacity-50 hover:opacity-80 transition-opacity"
                >
                  <p className="text-[9px] text-faint uppercase tracking-widest font-bold">{label}</p>
                  <p className="text-[9px] text-faint">{hint}</p>
                </button>
              );
            })}
          </div>
          {!hasAnySpec && (
            <p className="text-[10px] text-faint mt-2 text-center">Tap any spec to add via Edit</p>
          )}
        </div>

        <div className="border-t border-subtle" />

        {/* RICE card — tap to reprioritize */}
        <button
          onClick={() => openWizard(t)}
          className="w-full text-left bg-surface rounded-2xl border border-subtle p-5 relative overflow-hidden hover:border-default transition-colors group"
        >
          <div className="absolute top-0 left-0 h-1 w-full bg-raised">
            <div className={`h-full transition-all duration-500 ${getGaugeColor(t.column)}`} style={{ width: gaugeWidth }} />
          </div>
          <div className="flex justify-between items-end mt-2 mb-4">
            <div>
              <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Priority Tier</p>
              <p className={`text-xl font-black uppercase ${t.column === 'High' ? 'text-accent-primary' : t.column === 'Med' ? 'text-priority-med' : t.column === 'Later' ? 'text-faint' : 'text-priority-low'}`}>
                {t.column} Priority
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{score}</span>
              <span className="text-xs text-faint ml-1 block">RICE Pts</span>
              <span className="text-[9px] text-faint group-hover:text-accent-secondary transition-colors mt-1 block">
                tap to reprioritize →
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['reach', 'impact', 'confidence', 'effort'].map(metric => (
              <div key={metric} className="bg-raised rounded-xl p-2 text-center border border-default">
                <p className="text-[9px] text-faint uppercase tracking-widest font-bold mb-1">{METRIC_LABELS[metric]}</p>
                <p className="text-lg font-black text-accent-secondary">{t[metric]}</p>
              </div>
            ))}
          </div>
        </button>

      </div>
    </div>
  );
}