import React from 'react';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getGaugeColor } from '../lib/colors.js';
import { calculateScore } from '../lib/rice.js';
import { COLUMNS } from '../constants.js';

export default function TaskCard({ task }) {
  const { activeColIndex, completeTask, openWizard, handleLongPressStart, handleLongPressEnd } = useApp();

  return (
    <div
      onTouchStart={() => handleLongPressStart(task)}
      onTouchEnd={handleLongPressEnd}
      onContextMenu={e => { e.preventDefault(); openWizard(task); }}
      className="bg-surface rounded-2xl p-4 border border-subtle shadow-xl active:scale-95 transition-transform relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getGaugeColor(task.column)}`} />

      <div className="flex justify-between items-start mb-3 pl-2">
        <div>
          <h3 className="font-bold text-primary">{task.title}</h3>
          {task.tags?.length > 0 && (
            <div className="flex gap-1 mt-1">
              {task.tags.map(t => (
                <span key={t} className="text-[9px] bg-raised text-muted px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          )}
        </div>

        {COLUMNS[activeColIndex] !== 'To Sort' ? (
          <button
            onClick={() => completeTask(task.id)}
            className="w-7 h-7 shrink-0 rounded-full border-2 border-default flex items-center justify-center hover:bg-accent-secondary hover:border-accent-secondary transition-colors group ml-3"
          >
            <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-primary" />
          </button>
        ) : (
          <button
            onClick={() => openWizard(task)}
            className="text-[10px] bg-accent-amber/20 text-accent-amber font-bold border border-accent-amber/50 px-2 py-1 rounded ml-3 shrink-0"
          >
            Prioritize
          </button>
        )}
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
  );
}
