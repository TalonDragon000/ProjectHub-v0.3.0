import React from 'react';
import { X, Target, Check, Trash2 } from 'lucide-react'; // ← added Check, Trash2
import { useApp } from '../../context/AppContext.jsx';
import { getGaugeColor } from '../../lib/colors.js';
import { calculateScore } from '../../lib/rice.js';

const MOSCOW_COLOR = {
  Must: 'bg-accent-primary/20 text-accent-primary border-accent-primary/50',
  Should: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50',
  Could: 'bg-raised text-muted border-default',
  "Won't": 'bg-overlay text-faint border-default',
};

const METRIC_LABELS = {
  reach: 'Reach',
  impact: 'Impact',
  confidence: 'Confidence',
  effort: 'Effort',
};

export default function TaskViewModal() {
  const { viewTaskOpen, viewingTask, closeViewTask, openWizard, completeTask, deleteTask } = useApp();

  if (!viewTaskOpen || !viewingTask) return null;

  const t = viewingTask;
  const score = calculateScore(t.reach, t.impact, t.confidence, t.effort);
  const gaugeWidth = `${Math.min((parseFloat(score) / 40) * 100, 100)}%`;

  const handlePrioritize = () => openWizard(t);
  const handleComplete = () => { completeTask(t.id); closeViewTask(); };
  const handleDelete = () => { deleteTask(t.id); closeViewTask(); };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-base/95 backdrop-blur-xl animate-in slide-in-from-bottom-full overflow-hidden">

      {/* Colored priority bar */}
      <div className={`h-1 w-full ${getGaugeColor(t.column)}`} />

      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-4 pb-2">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${MOSCOW_COLOR[t.moscow] || 'bg-raised text-muted border-default'}`}>
          {t.moscow}
        </span>
        <button onClick={closeViewTask} className="text-muted p-2 hover:text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5"> {/* ← pb-36 → pb-8 */}

        {/* Title + description */}
        <div>
          <h2 className="text-2xl font-black text-primary leading-tight">{t.title}</h2>
          {t.description && (
            <p className="mt-2 text-sm text-secondary leading-relaxed">{t.description}</p>
          )}
        </div>

        {/* Tags */}
        {t.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {t.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-raised text-muted px-2 py-0.5 rounded-full border border-default">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ↓ Inline 3-column action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handlePrioritize}
            className="flex flex-col items-center justify-center gap-1.5 py-3 bg-surface border border-default rounded-xl text-xs font-bold text-primary hover:bg-raised transition-colors"
          >
            <Target className="w-4 h-4 text-accent-primary" />
            Prioritize
          </button>
          <button
            onClick={handleComplete}
            className="flex flex-col items-center justify-center gap-1.5 py-3 bg-accent-secondary/20 border border-accent-secondary/50 rounded-xl text-xs font-bold text-accent-secondary hover:bg-accent-secondary/30 transition-colors"
          >
            <Check className="w-4 h-4" />
            Complete
          </button>
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center gap-1.5 py-3 bg-transparent border border-red-500/25 rounded-xl text-xs font-bold text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Divider before RICE */}
        <div className="border-t border-subtle" />

        {/* RICE Score gauge */}
        <div className="bg-surface rounded-2xl border border-subtle p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-raised">
            <div
              className={`h-full transition-all duration-500 ${getGaugeColor(t.column)}`}
              style={{ width: gaugeWidth }}
            />
          </div>
          <div className="flex justify-between items-end mt-2 mb-4">
            <div>
              <p className="text-[10px] text-faint uppercase tracking-widest font-bold mb-1">Priority Tier</p>
              <button
                onClick={handlePrioritize}
                className="hover:scale-105"
                  >
              <p className={`text-xl font-black uppercase ${t.column === 'High' ? 'text-accent-primary' : t.column === 'Med' ? 'text-priority-med' : t.column === 'Later' ? 'text-faint' : 'text-priority-low'}`}>
                {t.column} Priority
              </p> [ EDIT ]
              </button>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{score}</span>
              <span className="text-xs text-faint ml-1 block">RICE Pts</span>
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
        </div>
      </div>
    </div>
  );
}