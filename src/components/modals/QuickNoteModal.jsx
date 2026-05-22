import React from 'react';
import { Zap, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function QuickNoteModal() {
  const { quickNoteOpen, setQuickNoteOpen, quickNoteText, setQuickNoteText, saveQuickNote } = useApp();

  if (!quickNoteOpen) return null;

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-md z-50 flex flex-col p-6 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-accent-amber flex items-center">
          <Zap className="mr-2" /> Brain Dump
        </h2>
        <button onClick={() => setQuickNoteOpen(false)} className="text-muted p-2"><X /></button>
      </div>
      <textarea
        autoFocus
        placeholder="Dump your idea here. We'll sort it later..."
        value={quickNoteText}
        onChange={e => setQuickNoteText(e.target.value)}
        className="w-full flex-1 bg-surface border border-subtle rounded-2xl p-4 text-primary outline-none focus:border-accent-amber resize-none"
      />
      <button
        onClick={saveQuickNote}
        className="w-full bg-accent-amber text-primary font-bold py-4 rounded-xl mt-6 shadow-amber active:scale-95"
      >
        Send to "To Sort"
      </button>
    </div>
  );
}
