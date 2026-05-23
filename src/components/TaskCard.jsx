import React, { useState } from 'react';
import { MoreHorizontal, Eye, Target, CircleCheck, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getGaugeColor } from '../lib/colors.js';
import { calculateScore } from '../lib/rice.js';
import { COLUMNS } from '../constants.js';

export default function TaskCard({ task }) {
  const {
    activeColIndex,
    completeTask,
    deleteTask,
    openWizard,
    openViewTask,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  const inSortColumn = COLUMNS[activeColIndex] === 'To Sort';

  const handleCardClick = () => {
    if (menuOpen) return;
    openViewTask(task);
  };

  const openMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  const handleView = (e) => {
    e.stopPropagation();
    closeMenu();
    openViewTask(task);
  };

  const handlePrioritize = (e) => {
    e.stopPropagation();
    closeMenu();
    openWizard(task);
  };

  const handleComplete = (e) => {
    e.stopPropagation();
    closeMenu();
    completeTask(task.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    closeMenu();
    deleteTask(task.id);
  };

  return (
    <div className="relative group">
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={closeMenu} />
      )}

      <div
        onClick={handleCardClick}
        className="bg-surface rounded-2xl p-4 border border-subtle shadow-xl transition-all duration-150 hover:shadow-2xl hover:border-default cursor-pointer relative overflow-hidden"
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getGaugeColor(task.column)}`} />

        <button
          onClick={openMenu}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-faint opacity-0 group-hover:opacity-100 hover:bg-raised hover:text-primary transition-all duration-150 z-10"
          aria-label="Task options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute top-10 right-3 z-40 bg-surface border border-subtle rounded-xl shadow-2xl min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-100">
            <button
              onClick={handleView}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors text-left"
            >
              <Eye className="w-4 h-4 shrink-0" />
              View
            </button>
            <button
              onClick={handlePrioritize}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors text-left"
            >
              <Target className="w-4 h-4 shrink-0" />
              Prioritize
            </button>
            {!inSortColumn && (
              <button
                onClick={handleComplete}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:bg-raised hover:text-primary transition-colors text-left"
              >
                <CircleCheck className="w-4 h-4 shrink-0" />
                Complete
              </button>
            )}
            <div className="border-t border-subtle" />
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              Delete
            </button>
          </div>
        )}

        <div className="flex items-start mb-2 pl-2 pr-8">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-primary leading-snug">{task.title}</h3>
            {task.description && (
              <p className="text-xs text-muted mt-0.5 leading-snug line-clamp-2">{task.description}</p>
            )}
            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {task.tags.map(t => (
                  <span key={t} className="text-[9px] bg-raised text-muted px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2 text-xs pl-2">
          <span className="bg-base text-accent-secondary px-2 py-1 rounded border border-subtle font-bold flex items-center">
            RICE: {calculateScore(task.reach, task.impact, task.confidence, task.effort)}
          </span>
          <span className={`px-2 py-1 rounded border font-bold ${task.moscow === 'Must' ? 'bg-accent-primary/30 border-accent-primary text-accent-primary' : 'bg-base border-subtle text-muted'}`}>
            {task.moscow}
          </span>
        </div>
      </div>
    </div>
  );
}
