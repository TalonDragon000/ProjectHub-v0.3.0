import React from 'react';
import { Folder, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function VaultModal() {
  const { vaultOpen, setVaultOpen, projects, activeProjectId, setActiveProjectId } = useApp();

  if (!vaultOpen) return null;

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-md z-40 flex flex-col p-6 animate-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-8 pt-4">
        <h2 className="text-2xl font-bold text-primary flex items-center">
          <Folder className="mr-2 text-accent-tertiary" /> The Vault
        </h2>
        <button onClick={() => setVaultOpen(false)} className="text-muted p-2"><X /></button>
      </div>
      <p className="text-sm text-muted mb-4">Switching projects will refocus your dashboard. Only one active project allowed.</p>
      <div className="space-y-3">
        {projects.map(p => (
          <div
            key={p.id}
            onClick={() => { setActiveProjectId(p.id); setVaultOpen(false); }}
            className={`p-4 rounded-2xl border cursor-pointer transition-colors ${p.id === activeProjectId ? 'bg-accent-tertiary/20 border-accent-tertiary' : 'bg-surface border-subtle hover:border-strong'}`}
          >
            <h3 className={`font-bold ${p.id === activeProjectId ? 'text-accent-tertiary' : 'text-primary'}`}>{p.name}</h3>
            <p className="text-xs text-faint mt-1 truncate">{p.mission}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
