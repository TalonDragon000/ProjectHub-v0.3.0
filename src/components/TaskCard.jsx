import React, { useState } from 'react';
import { MoreHorizontal, Eye, Target, CircleCheck, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getGaugeColor } from '../lib/colors.js';
import { calculateScore } from '../lib/rice.js';
import { COLUMNS } from '../constants.js';

export default function TaskCard({ task }) {
  const { activeColIndex, completeTask, deleteTask, openWizard, openViewTask } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const inSortColumn = COLUMNS[activeColIndex] === 'To Sort';

  const handleCardClick = () => { if (menuOpen) return; openViewTask(task); };
  const openMenu = (e) => { e.stopPropagation(); setMenuOpen(true); };
  const closeMenu = () => setMenuOpen(false);

  const handleView = (e) => { e.stopPropagation(); closeMenu(); openViewTask(task); };
  const handlePrioritize = (e) => { e.stopPropagation(); closeMenu(); openWizard(task); };
  const handleComplete = (e) => { e.stopPropagation(); completeTask(task.id); };
  const handleDelete = (e) => { e.stopPropagation(); closeMenu(); deleteTask(task.id); };

  return (
    <div className="relative group">
      {menuOpen && <div className="fixed inset-0 z-30" onClick={closeMenu} />}

      {/* Dropdown — outside overflow-hidden card */}
      {menuOpen && (
        <div className="absolute top-8 right-20 z-40 bg-surface border border-subtle rounded-xl shadow-2xl overflow-hidden min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-100">
          <button onClick={handleView} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors text-left">
            <Eye className="w-4 h-4 shrink-0" /> View
          </button>
          <button onClick={handlePrioritize} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors text-left">
            <Target className="w-4 h-4 shrink-0" /> Prioritize
          </button>
          <div className="border-t border-subtle" />
          <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left">
            <Trash2 className="w-4 h-4 shrink-0" /> Delete
          </button>
        </div>
      )}

      {/* Card — flex row so complete column sits naturally beside content */}
      <div
        onClick={handleCardClick}
        className="bg-surface rounded-2xl border border-subtle shadow-xl transition-all duration-150 hover:shadow-2xl hover:border-default cursor-pointer flex overflow-hidden"
      >
        {/* Priority stripe */}
        <div className={`w-1 shrink-0 ${getGaugeColor(task.column)}`} />

        {/* Main content */}
        <div className="flex-1 min-w-0 p-4">

          {/* Title row — ... appears inline on hover */}
          <div className="flex items-start gap-1 mb-1">
            <h3 className="font-bold text-primary leading-snug flex-1 min-w-0">{task.title}</h3>
            <button
              onClick={openMenu}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-faint opacity-0 group-hover:opacity-100 hover:bg-raised hover:text-primary transition-all duration-150 mt-0.5"
              aria-label="Task options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-muted leading-snug line-clamp-2 mb-2">{task.description}</p>
          )}
          {task.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map(t => (
                <span key={t} className="text-[9px] bg-raised text-muted px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          )}

          <div className="flex gap-2 text-xs">
            <span className="bg-base text-accent-secondary px-2 py-1 rounded border border-subtle font-bold">
              RICE: {calculateScore(task.reach, task.impact, task.confidence, task.effort)}
            </span>
            <span className={`px-2 py-1 rounded border font-bold ${task.moscow === 'Must' ? 'bg-accent-primary/30 border-accent-primary text-accent-primary' : 'bg-base border-subtle text-muted'}`}>
              {task.moscow}
            </span>
          </div>
        </div>

        {/* Complete column — always visible, full card height */}
        {!inSortColumn && (
          <button
            onClick={handleComplete}
            className="shrink-0 w-14 flex flex-col items-center justify-center gap-1.5 border-l border-subtle text-faint hover:text-accent-secondary hover:bg-accent-secondary/10 transition-colors duration-150"
            aria-label="Mark complete"
          >
            <CircleCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold">Complete</span>
          </button>
        )}
      </div>
    </div>
  );
}