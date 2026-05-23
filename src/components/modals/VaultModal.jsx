import React, { useState } from 'react';
import { Folder, X, Pin, PinOff, ArchiveRestore, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

function ProjectRow({ project, isActive, onSelect, onPin }) {
  return (
    <div
      className={`flex items-center rounded-2xl border transition-colors overflow-hidden ${
        isActive
          ? 'bg-accent-tertiary/20 border-accent-tertiary'
          : 'bg-surface border-subtle hover:border-strong'
      }`}
    >
      {/* Pinned stripe */}
      {project.pinned && (
        <div className="w-1 self-stretch bg-accent-secondary shrink-0" />
      )}

      <div onClick={onSelect} className="flex-1 min-w-0 px-4 py-4 cursor-pointer">
        <div className="flex items-center gap-1.5 min-w-0">
          {project.pinned && <Pin className="w-3 h-3 text-accent-secondary shrink-0" />}
          <h3 className={`font-bold truncate ${isActive ? 'text-accent-tertiary' : 'text-primary'}`}>
            {project.name}
          </h3>
        </div>
        {project.mission && (
          <p className="text-xs text-faint mt-0.5 truncate">{project.mission}</p>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onPin(); }}
        className={`shrink-0 mr-3 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          project.pinned
            ? 'text-accent-secondary hover:bg-accent-secondary/10'
            : 'text-faint hover:text-muted hover:bg-raised'
        }`}
        aria-label={project.pinned ? 'Unpin project' : 'Pin project'}
      >
        {project.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function ArchivedRow({ project, onRestore }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-subtle bg-surface opacity-60">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm text-muted truncate">{project.name}</h3>
        {project.mission && (
          <p className="text-xs text-faint mt-0.5 truncate">{project.mission}</p>
        )}
      </div>
      <button
        onClick={onRestore}
        className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-accent-secondary bg-accent-secondary/10 hover:bg-accent-secondary/20 border border-accent-secondary/30 px-3 py-1.5 rounded-lg transition-colors opacity-100"
      >
        <ArchiveRestore className="w-3.5 h-3.5" /> Restore
      </button>
    </div>
  );
}

export default function VaultModal() {
  const {
    vaultOpen, setVaultOpen,
    activeProjectId, setActiveProjectId,
    activeProjects, archivedProjects,
    pinProject, restoreProject,
    setOnboardingOpen,
  } = useApp();

  const [archiveExpanded, setArchiveExpanded] = useState(false);

  if (!vaultOpen) return null;

  const handleSelect = (id) => {
    setActiveProjectId(id);
    setVaultOpen(false);
  };

  return (
    <div className="absolute inset-0 bg-base/95 backdrop-blur-md z-40 flex flex-col p-6 animate-in slide-in-from-top-4">

      <div className="flex justify-between items-center mb-4 pt-4">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Folder className="text-accent-tertiary" /> The Vault
        </h2>
        <button onClick={() => setVaultOpen(false)} className="text-muted p-2 hover:text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-muted mb-5 leading-snug">
        One active project at a time. Pin favorites to keep them at the top.
      </p>

      <div className="flex-1 overflow-y-auto space-y-6 pb-20">

        {/* Active projects */}
        <section className="space-y-2">
          <p className="text-[10px] text-faint uppercase tracking-widest font-bold">
            Active ({activeProjects.length})
          </p>
          {activeProjects.length === 0 ? (
            <p className="text-sm text-faint italic px-1">
              No active projects. Restore an archived project below.
            </p>
          ) : (
            <div className="space-y-2">
              {activeProjects.map(p => (
                <ProjectRow
                  key={p.id}
                  project={p}
                  isActive={p.id === activeProjectId}
                  onSelect={() => handleSelect(p.id)}
                  onPin={() => pinProject(p.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Archived accordion */}
        {archivedProjects.length > 0 && (
          <section className="space-y-2">
            <button
              onClick={() => setArchiveExpanded(v => !v)}
              className="w-full flex items-center justify-between text-[10px] text-faint uppercase tracking-widest font-bold hover:text-muted transition-colors py-1"
            >
              <span>Archived ({archivedProjects.length})</span>
              {archiveExpanded
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />
              }
            </button>

            {archiveExpanded && (
              <div className="space-y-2 animate-in fade-in-0 duration-150">
                {archivedProjects.map(p => (
                  <ArchivedRow
                    key={p.id}
                    project={p}
                    onRestore={() => restoreProject(p.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* Floating new project button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => { setVaultOpen(false); setOnboardingOpen(true); }}
          className="w-full flex items-center justify-center gap-2 bg-accent-tertiary text-inverted font-bold py-4 rounded-2xl shadow-tertiary active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>
    </div>
  );
}
