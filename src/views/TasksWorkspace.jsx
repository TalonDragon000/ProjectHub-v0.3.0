import React from 'react';
import { ChevronLeft, ChevronRight, CircleCheck as CheckCircle2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { COLUMNS } from '../constants.js';

export default function TasksWorkspace() {
  const { activeColIndex, setActiveColIndex, activeTasks, setQuickNoteOpen } = useApp();

  return (
    <div className="TasksHeader h-full flex flex-col pt-4">

      {/* Pagination Header */}
      <div className="flex justify-between items-center px-4 mb-4">
        <h2 className="text-2xl font-black tracking-wide uppercase text-primary flex items-center">
          {COLUMNS[activeColIndex]}
          <span className="text-faint text-sm ml-2 font-bold tracking-normal uppercase">Priority</span>
        </h2>
        <div className="flex space-x-1.5">
          {COLUMNS.map((col, i) => (
            <div
              key={col}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeColIndex ? 'w-6 bg-accent-primary' : 'w-1.5 bg-overlay'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 relative flex">

        {/* Left peek */}
        {activeColIndex > 0 && (
          <div
            className="w-[15px] h-full bg-gradient-to-r from-raised/80 to-transparent border-r border-default/50 flex flex-col justify-center items-center cursor-pointer backdrop-blur-sm"
            onClick={() => setActiveColIndex(c => c - 1)}
          >
            <ChevronLeft className="text-faint/50 w-3 h-3 -mr-1" />
          </div>
        )}

        <div className="flex-1 px-4 pb-32 overflow-y-auto space-y-3">

          {COLUMNS[activeColIndex] === 'To Sort' && (
            <button
              onClick={() => setQuickNoteOpen(true)}
              className="w-full border-2 border-dashed border-default rounded-2xl p-4 text-muted flex items-center justify-center space-x-2 hover:bg-raised hover:border-accent-amber transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">Raw Brain Dump</span>
            </button>
          )}

          {activeTasks.length === 0 && COLUMNS[activeColIndex] !== 'To Sort' && (
            <div className="mt-10 flex flex-col items-center text-faint space-y-2">
              <CheckCircle2 className="w-10 h-10 opacity-20" />
              <p className="text-sm font-bold">Zone Clear</p>
            </div>
          )}

          {activeTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>

        {/* Right peek */}
        {activeColIndex < COLUMNS.length - 1 && (
          <div
            className="w-[15px] h-full bg-gradient-to-l from-raised/80 to-transparent border-l border-default/50 flex flex-col justify-center items-center cursor-pointer backdrop-blur-sm"
            onClick={() => setActiveColIndex(c => c + 1)}
          >
            <ChevronRight className="text-faint/50 w-3 h-3 -ml-1" />
          </div>
        )}

      </div>
    </div>
  );
}
