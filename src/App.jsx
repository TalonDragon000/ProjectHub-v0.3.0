import React, { useState, useEffect, useRef } from 'react';
import { Chrome as Home, LayoutList, Plus, CircleHelp as HelpCircle, X, Target, Briefcase, Zap, CircleCheck as CheckCircle2, ChevronRight, ChevronLeft, Folder } from 'lucide-react';

// --- INITIAL DATA & CONFIG ---
const COLUMNS = ['High', 'Med', 'Low', 'Later', 'To Sort'];
const FIBONACCI = [1, 2, 3, 5, 8];
const QUICK_TAGS = ['Marketing', 'Engagement', 'Maintenance', 'Feature', 'Bug Fix'];

const RICE_HINTS = {
  reach: {
    title: "Reach: How many users does this affect?",
    desc: "1 (Just you), 2 (A few), 3 (Some), 5 (Many), 8 (Everyone)."
  },
  impact: {
    title: "Impact: How much does it move the needle?",
    desc: "1 (Minimal), 2 (Small), 3 (Med), 5 (Large), 8 (Massive)."
  },
  confidence: {
    title: "Confidence: How sure are you of these estimates?",
    desc: "1 (Wild guess), 2 (Low), 3 (Med), 5 (High), 8 (Data-backed/100%)."
  },
  effort: {
    title: "Effort: How much work is required?",
    desc: "1 (Hours), 2 (A day), 3 (Few days), 5 (A week), 8 (Epic/Weeks). Higher effort lowers the total score."
  }
};

const INITIAL_PROJECTS = [
  { id: 1, name: 'Demo Project', mission: 'A sample setup for you to explore.' }
];

const INITIAL_TASKS = [
  { id: 1, projectId: 1, title: 'Swipe to view next column', reach: 5, impact: 8, confidence: 5, effort: 3, moscow: 'Must', column: 'High', completed: false, tags: ['Core Feature'] },
  { id: 2, projectId: 1, title: 'Long-press to edit task', reach: 8, impact: 5, confidence: 8, effort: 5, moscow: 'Should', column: 'Med', completed: false, tags: ['Marketing'] },
  { id: 3, projectId: 1, title: 'Complete task to archive', reach: 8, impact: 3, confidence: 3, effort: 8, moscow: 'Could', column: 'Low', completed: false, tags: ['Maintenance'] },
];

const fireConfetti = () => {
  if (typeof window.confetti !== 'function') return;
  const style = getComputedStyle(document.documentElement);
  const colors = [1, 2, 3, 4, 5].map(n => style.getPropertyValue(`--confetti-${n}`).trim());
  window.confetti({ particleCount: 80, spread: 70, origin: { x: 0.5, y: 0.5 }, colors });
};

export default function App() {
  // --- APP STATE ---
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(1);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('home'); // 'home' or 'tasks'
  const [activeColIndex, setActiveColIndex] = useState(0);

  // --- MODAL & MENU STATES ---
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [goalToast, setGoalToast] = useState(false);

  // --- WIZARD FORM STATE ---
  const [wizardForm, setWizardForm] = useState({
    title: '', reach: 3, impact: 3, confidence: 3, effort: 3, moscow: 'Should', infoOpen: null, tags: []
  });
  const [customTagInput, setCustomTagInput] = useState('');

  const [projectForm, setProjectForm] = useState({ name: '', mission: '' });
  const [quickNoteText, setQuickNoteText] = useState('');

  // --- SWIPE / GESTURE REFS ---
  const touchStartX = useRef(0);
  const pressTimer = useRef(null);

  // --- DERIVED STATE ---
  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const activeTasks = projectTasks.filter(t => t.column === COLUMNS[activeColIndex] && !t.completed);
  const completedTasks = projectTasks.filter(t => t.completed);

  // --- LOGIC: RICE & MoSCoW ---
  const calculateScore = (r, i, c, e) => ((r * i * c) / e).toFixed(1);

  const predictColumn = (score, moscow) => {
    if (moscow === "Won't") return 'Later';
    if (moscow === 'Must') return 'High';
    if (score >= 25) return 'High';
    if (score >= 10) return 'Med';
    return 'Low';
  };

  const getGaugeColor = (column) => {
    switch(column) {
      case 'High':  return 'bg-priority-high';
      case 'Med':   return 'bg-priority-med';
      case 'Low':   return 'bg-priority-low';
      case 'Later': return 'bg-priority-later';
      default:      return 'bg-accent-secondary';
    }
  };

  // --- EVENT HANDLERS ---
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50 && activeColIndex < COLUMNS.length - 1) setActiveColIndex(c => c + 1);
    if (diff < -50 && activeColIndex > 0) setActiveColIndex(c => c - 1);
  };

  const handleLongPressStart = (task) => {
    pressTimer.current = setTimeout(() => openWizard(task), 500);
  };
  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  // --- ACTIONS ---
  const openWizard = (task = null) => {
    setGlobalMenuOpen(false);
    setCustomTagInput('');
    if (task) {
      setEditingTask(task.id);
      setWizardForm({ ...task, infoOpen: null });
    } else {
      setEditingTask(null);
      setWizardForm({ title: '', reach: 3, impact: 3, confidence: 3, effort: 3, moscow: 'Should', infoOpen: null, tags: [] });
    }
    setWizardOpen(true);
  };

  const saveWizard = () => {
    const newScore = calculateScore(wizardForm.reach, wizardForm.impact, wizardForm.confidence, wizardForm.effort);
    const newCol = predictColumn(newScore, wizardForm.moscow);

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask ? { ...t, ...wizardForm, column: newCol } : t));
    } else {
      setTasks([...tasks, { id: Date.now(), projectId: activeProjectId, ...wizardForm, column: newCol, completed: false }]);
    }
    setWizardOpen(false);
  };

  const saveQuickNote = () => {
    if (!quickNoteText.trim()) return;
    setTasks([...tasks, {
      id: Date.now(), projectId: activeProjectId, title: quickNoteText,
      reach: 3, impact: 3, confidence: 3, effort: 3, moscow: 'Should',
      column: 'To Sort', completed: false, tags: []
    }]);
    setQuickNoteText('');
    setQuickNoteOpen(false);
    setActiveTab('tasks');
    setActiveColIndex(4); // Jump to 'To Sort'
  };

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject = { id: Date.now(), ...projectForm };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
    setProjectForm({ name: '', mission: '' });
    setOnboardingOpen(false);
    setGlobalMenuOpen(false);
    setVaultOpen(false);
    setActiveTab('home');
  };

  const completeTask = (id) => {
    fireConfetti();
    setGoalToast(true);
    setTimeout(() => setGoalToast(false), 2200);
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  const toggleTag = (tag) => {
    setWizardForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  // Ensure Onboarding triggers if no projects exist
  useEffect(() => {
    if (projects.length === 0) setOnboardingOpen(true);
  }, [projects]);

  // --- RENDERERS ---
  const currentScore = calculateScore(wizardForm.reach, wizardForm.impact, wizardForm.confidence, wizardForm.effort);
  const predictedColumn = predictColumn(currentScore, wizardForm.moscow);

  // Roadmap logic
  const nowTasks = projectTasks.filter(t => t.column === 'High' && !t.completed);
  const nextTasks = projectTasks.filter(t => (t.column === 'Med' || t.column === 'Low') && !t.completed);

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-bg-base text-text-primary flex flex-col font-sans relative overflow-hidden select-none">

      {/* --- HEADER --- */}
      <header className="p-4 border-b border-subtle flex justify-between items-center bg-bg-surface z-10">
        <div onClick={() => setVaultOpen(true)} className="cursor-pointer active:opacity-70 flex items-center space-x-2">
          <Folder className="w-5 h-5 text-accent-tertiary-text" />
          <div>
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary-text leading-tight">
              {activeProject?.name || "Project Hub"}
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Tap to open Vault</p>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

        {/* --- MODE A: STRATEGY DASHBOARD (HOME) --- */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-8 pb-24">
            {/* Progress & Mission */}
            <section className="flex items-center space-x-4 p-4 bg-bg-surface rounded-2xl border border-subtle shadow-lg">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-bg-raised" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-accent-secondary-text" strokeDasharray={`${(completedTasks.length / (projectTasks.length || 1)) * 100}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent-secondary-text">
                  {Math.round((completedTasks.length / (projectTasks.length || 1)) * 100)}%
                </div>
              </div>
              <div>
                <h2 className="font-bold text-sm text-text-secondary">Mission</h2>
                <p className="text-xs text-text-muted leading-snug italic">"{activeProject?.mission}"</p>
              </div>
            </section>

            {/* Strategy Specs (Who, What, Why) */}
            <section className="space-y-2">
              <h3 className="text-accent-secondary-text text-xs font-bold uppercase tracking-widest flex items-center"><Target className="w-4 h-4 mr-1"/> Strategy Specs</h3><span className="text-[10px] text-text-faint">( Coming Soon )</span>
              <div className="grid grid-cols-3 gap-2">
                {['WHO (Audience)', 'WHAT (Product)', 'WHY (Problem)'].map(spec => (
                  <div key={spec} className="bg-bg-surface p-3 rounded-xl border border-subtle border-dashed text-center flex flex-col justify-center items-center opacity-60">
                    <span className="text-[10px] text-text-faint mb-1">{spec}</span>
                    <Plus className="w-4 h-4 text-text-faint" />
                  </div>
                ))}
              </div>
            </section>

            {/* GO Roadmap (Timeline) */}
            <section className="space-y-2">
              <h3 className="text-accent-primary-text text-xs font-bold uppercase tracking-widest flex items-center"><Zap className="w-4 h-4 mr-1"/> GO Roadmap</h3>
              <div className="bg-bg-surface rounded-2xl p-4 border border-subtle space-y-4 shadow-lg">
                <div className="border-l-2 border-accent-primary pl-4 relative">
                  <div className="absolute w-2 h-2 bg-priority-high rounded-full -left-[5px] top-1"></div>
                  <span className="text-xs font-bold text-accent-primary uppercase">Now</span>
                  {nowTasks.length === 0 ? <p className="text-xs text-text-faint italic mt-1">No high priority goals.</p> :
                    nowTasks.map(t => <p key={t.id} className="text-sm text-text-primary mt-1">{t.title}</p>)}
                </div>
                <div className="border-l-2 border-priority-med pl-4 relative">
                  <div className="absolute w-2 h-2 bg-priority-med rounded-full -left-[5px] top-1"></div>
                  <span className="text-xs font-bold text-priority-med-text uppercase">Next</span>
                  {nextTasks.length === 0 ? <p className="text-xs text-text-faint italic mt-1">Empty queue.</p> :
                    nextTasks.map(t => <p key={t.id} className="text-sm text-text-muted mt-1">{t.title}</p>)}
                </div>
              </div>
            </section>

            {/* Devlog (Recent Wins) */}
            <section className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-accent-tertiary-text text-xs font-bold uppercase tracking-widest flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Devlog</h3>
              </div>

              <div className="space-y-2">
                {completedTasks.length === 0 && <div className="text-sm text-text-faint italic p-4 bg-bg-surface rounded-xl border border-subtle text-center">
                  <p>Devlog Empty.</p>
                <span className="text-[10px] not-italic">( Complete a task to start the list. )</span></div>}
                {completedTasks.slice().reverse().map(t => (
                  <div key={t.id} className="p-3 bg-bg-surface rounded-xl border border-subtle flex justify-between items-center opacity-60">
                    <span className="line-through text-text-muted text-sm">{t.title}</span>
                    <span className="text-[10px] bg-priority-med/30 text-priority-med-text px-2 py-1 rounded border border-priority-med">☑️ Done</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- MODE B: TASKS WORKSPACE (KANBAN) --- */}
        {activeTab === 'tasks' && (
          <div className="h-full flex flex-col pt-4">
            {/* Pagination Header */}
            <div className="flex justify-between items-center px-4 mb-4">
              <h2 className="text-2xl font-black tracking-wide uppercase text-white flex items-center">
                {COLUMNS[activeColIndex]} <span className="text-text-faint text-sm ml-2 font-bold tracking-normal uppercase">Priority</span>
              </h2>
              <div className="flex space-x-1.5">
                {COLUMNS.map((col, i) => (
                  <div key={col} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeColIndex ? 'w-6 bg-accent-primary' : 'w-1.5 bg-bg-overlay'}`} />
                ))}
              </div>
            </div>

            <div className="flex-1 relative flex">
              {/* Left "Peek" Mechanic for backward navigation */}
              {activeColIndex > 0 && (
                <div
                  className="w-[15px] h-full bg-gradient-to-r from-bg-raised/80 to-transparent border-r border-border-default/50 flex flex-col justify-center items-center cursor-pointer backdrop-blur-sm"
                  onClick={() => setActiveColIndex(c => c - 1)}
                >
                  <ChevronLeft className="text-text-faint/50 w-3 h-3 -mr-1" />
                </div>
              )}

              <div className="flex-1 px-4 pb-32 overflow-y-auto space-y-3">

                {/* Ghost Entry for "To Sort" */}
                {COLUMNS[activeColIndex] === 'To Sort' && (
                  <button onClick={() => setQuickNoteOpen(true)} className="w-full border-2 border-dashed border-border-default rounded-2xl p-4 text-text-muted flex items-center justify-center space-x-2 hover:bg-bg-raised hover:border-accent-amber transition-colors">
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Raw Brain Dump</span>
                  </button>
                )}

                {/* Task Cards */}
                {activeTasks.length === 0 && COLUMNS[activeColIndex] !== 'To Sort' && (
                  <div className="mt-10 flex flex-col items-center text-text-faint space-y-2">
                    <CheckCircle2 className="w-10 h-10 opacity-20" />
                    <p className="text-sm font-bold">Zone Clear</p>
                  </div>
                )}

                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    onTouchStart={() => handleLongPressStart(task)}
                    onTouchEnd={handleLongPressEnd}
                    onContextMenu={(e) => { e.preventDefault(); openWizard(task); }} // Desktop fallback
                    className="bg-bg-surface rounded-2xl p-4 border border-subtle shadow-xl active:scale-95 transition-transform relative overflow-hidden"
                  >
                    {/* Color indicator accent */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getGaugeColor(task.column)}`}></div>

                    <div className="flex justify-between items-start mb-3 pl-2">
                      <div>
                        <h3 className="font-bold text-text-primary">{task.title}</h3>
                        {task.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.tags.map(t => <span key={t} className="text-[9px] bg-bg-raised text-text-muted px-1.5 py-0.5 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>

                      {COLUMNS[activeColIndex] !== 'To Sort' ? (
                        <button onClick={() => completeTask(task.id)} className="w-7 h-7 shrink-0 rounded-full border-2 border-border-default flex items-center justify-center hover:bg-accent-secondary hover:border-accent-secondary transition-colors group ml-3">
                          <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-white" />
                        </button>
                      ) : (
                        <button onClick={() => openWizard(task)} className="text-[10px] bg-accent-amber/20 text-accent-amber-text font-bold border border-accent-amber-dim px-2 py-1 rounded ml-3 shrink-0">Prioritize</button>
                      )}
                    </div>

                    <div className="flex space-x-2 text-xs pl-2">
                      <span className="bg-bg-base text-accent-secondary-text px-2 py-1 rounded border border-subtle font-bold flex items-center">
                        RICE: {calculateScore(task.reach, task.impact, task.confidence, task.effort)}
                      </span>
                      <span className={`px-2 py-1 rounded border font-bold ${task.moscow === 'Must' ? 'bg-accent-primary/30 border-accent-primary text-accent-primary-text' : 'bg-bg-base border-subtle text-text-muted'}`}>
                        {task.moscow}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* The "Peek" Mechanic */}
              {activeColIndex < COLUMNS.length - 1 && (
                <div
                  className="w-[15px] h-full bg-gradient-to-l from-bg-raised/80 to-transparent border-l border-border-default/50 flex flex-col justify-center items-center cursor-pointer backdrop-blur-sm"
                  onClick={() => setActiveColIndex(c => c + 1)}
                >
                  <ChevronRight className="text-text-faint/50 w-3 h-3 -ml-1" />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVIGATION DOCK --- */}
      <nav className="absolute bottom-0 w-full bg-bg-surface border-t border-subtle pb-safe pt-2 px-8 flex justify-between items-center z-20" style={{ boxShadow: `0 -10px 40px var(--shadow-nav)` }}>
        <button onClick={() => {setActiveTab('home'); setGlobalMenuOpen(false);}} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'home' ? 'text-accent-secondary-text' : 'text-text-faint'}`}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[9px] uppercase font-bold tracking-widest">Home</span>
        </button>

        {/* Central Raised Dock Button */}
        <div className="relative -top-6">
          <button
            onClick={() => setGlobalMenuOpen(!globalMenuOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl border-4 border-bg-base transition-all duration-300 ${globalMenuOpen ? 'bg-bg-overlay rotate-45 shadow-lg' : 'bg-gradient-to-br from-accent-primary to-accent-tertiary active:scale-95'}`}
            style={{ boxShadow: globalMenuOpen ? undefined : `0 4px 20px var(--shadow-dock-btn)` }}
          >
            {globalMenuOpen ? <X /> : <Plus />}
          </button>
        </div>

        <button onClick={() => {setActiveTab('tasks'); setGlobalMenuOpen(false);}} className={`flex flex-col items-center p-2 transition-colors ${activeTab === 'tasks' ? 'text-accent-primary-text' : 'text-text-faint'}`}>
          <LayoutList className="w-6 h-6 mb-1" />
          <span className="text-[9px] uppercase font-bold tracking-widest">Tasks</span>
        </button>
      </nav>

      {/* --- GLOBAL '+' MENU OVERLAY --- */}
      {globalMenuOpen && (
        <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm z-10 flex flex-col justify-end items-center pb-28 px-6 animate-in fade-in">
          <div className="space-y-4 w-full max-w-xs">
            <button onClick={() => openWizard()} className="w-full bg-bg-surface border border-border-default text-white font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-primary transition-colors">
              <Target className="text-accent-primary w-5 h-5" />
              <span>New Priority Task</span>
            </button>
            <button onClick={() => {setGlobalMenuOpen(false); setQuickNoteOpen(true);}} className="w-full bg-bg-surface border border-border-default text-white font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-amber transition-colors">
              <Zap className="text-accent-amber-text w-5 h-5" />
              <span>Quick Note (To Sort)</span>
            </button>
            <button onClick={() => {setGlobalMenuOpen(false); setOnboardingOpen(true);}} className="w-full bg-bg-surface border border-border-default text-white font-bold p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-lg hover:border-accent-tertiary transition-colors">
              <Briefcase className="text-accent-tertiary-text w-5 h-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      )}

      {/* --- QUICK NOTE (BRAIN DUMP) MODAL --- */}
      {quickNoteOpen && (
        <div className="absolute inset-0 bg-bg-base/95 backdrop-blur-md z-50 flex flex-col p-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-accent-amber-text flex items-center"><Zap className="mr-2"/> Brain Dump</h2>
            <button onClick={() => setQuickNoteOpen(false)} className="text-text-muted p-2"><X /></button>
          </div>
          <textarea
            autoFocus
            placeholder="Dump your idea here. We'll sort it later..."
            value={quickNoteText}
            onChange={(e) => setQuickNoteText(e.target.value)}
            className="w-full flex-1 bg-bg-surface border border-subtle rounded-2xl p-4 text-white outline-none focus:border-accent-amber resize-none"
          ></textarea>
          <button onClick={saveQuickNote} className="w-full bg-accent-amber text-white font-bold py-4 rounded-xl mt-6 shadow-lg active:scale-95" style={{ boxShadow: `0 4px 16px var(--accent-amber-shadow)` }}>
            Send to "To Sort"
          </button>
        </div>
      )}

      {/* --- PROJECT ONBOARDING / VAULT MODALS --- */}
      {onboardingOpen && (
        <div className="absolute inset-0 bg-bg-base z-50 flex flex-col justify-center p-8 animate-in zoom-in-95">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-2">New Project</h2>
            <p className="text-text-muted text-sm">A 10-second start to maintain focus.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-text-faint uppercase tracking-widest ml-1 mb-1 block">Project Name</label>
              <input type="text" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} placeholder="e.g. DeFi Wallet" className="w-full bg-bg-surface border-b-2 border-border-default focus:border-accent-tertiary outline-none px-3 py-4 text-xl text-white rounded-t-xl transition-colors"/>
            </div>
            <div>
              <label className="text-xs font-bold text-text-faint uppercase tracking-widest ml-1 mb-1 block">Core Mission (One sentence)</label>
              <input type="text" value={projectForm.mission} onChange={e => setProjectForm({...projectForm, mission: e.target.value})} placeholder="Why are we building this?" className="w-full bg-bg-surface border-b-2 border-border-default focus:border-accent-tertiary outline-none px-3 py-4 text-lg text-white rounded-t-xl transition-colors"/>
            </div>
            <button onClick={createProject} className="w-full bg-accent-tertiary text-white font-bold py-4 rounded-xl mt-8 active:scale-95 transition-transform" style={{ boxShadow: `0 4px 20px var(--accent-tertiary-bg-dim)` }}>
              Start Building
            </button>
            {projects.length > 0 && (
              <button onClick={() => setOnboardingOpen(false)} className="w-full text-text-faint text-sm mt-4 p-2">Cancel</button>
            )}
          </div>
        </div>
      )}

      {vaultOpen && (
        <div className="absolute inset-0 bg-bg-base/95 backdrop-blur-md z-40 flex flex-col p-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-8 pt-4">
            <h2 className="text-2xl font-bold text-white flex items-center"><Folder className="mr-2 text-accent-tertiary-text"/> The Vault</h2>
            <button onClick={() => setVaultOpen(false)} className="text-text-muted p-2"><X /></button>
          </div>
          <p className="text-sm text-text-muted mb-4">Switching projects will refocus your dashboard. Only one active project allowed.</p>
          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} onClick={() => {setActiveProjectId(p.id); setVaultOpen(false);}} className={`p-4 rounded-2xl border cursor-pointer transition-colors ${p.id === activeProjectId ? 'bg-accent-tertiary/20 border-accent-tertiary' : 'bg-bg-surface border-subtle hover:border-border-strong'}`}>
                <h3 className={`font-bold ${p.id === activeProjectId ? 'text-accent-tertiary-text' : 'text-text-primary'}`}>{p.name}</h3>
                <p className="text-xs text-text-faint mt-1 truncate">{p.mission}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- INTENTIONAL PRIORITY WIZARD (THE GATEKEEPER) --- */}
      {wizardOpen && (
        <div className="absolute inset-0 bg-bg-base/95 backdrop-blur-xl z-50 flex flex-col p-4 animate-in slide-in-from-bottom-full overflow-hidden">
          <div className="flex justify-between items-center mb-4 pt-2">
            <h2 className="text-xl font-bold text-white flex items-center"><Target className="w-5 h-5 mr-2 text-accent-primary"/> Priority Wizard</h2>
            <button onClick={() => setWizardOpen(false)} className="text-text-muted p-2"><X /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pb-24 hide-scrollbar px-2">

            {/* Goal Input & Quick Tags */}
            <div className="space-y-3">
              <input
                type="text" placeholder="Goal Name..." value={wizardForm.title} onChange={e => setWizardForm({...wizardForm, title: e.target.value})}
                className="w-full bg-transparent border-b-2 border-border-default focus:border-accent-primary outline-none py-2 text-2xl font-bold text-white transition-colors"
              />
              <div className="flex flex-wrap gap-2 items-center">

              <div>
              <label className="text-[10px] text-text-faint font-bold uppercase tracking-widest mb-1 px-1 block">Quick Tags</label>
                {QUICK_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`text-[10px] px-2 py-1 mx-0.5 rounded-full border transition-colors ${wizardForm.tags.includes(tag) ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-surface border-border-default text-text-muted hover:border-border-strong'}`}>
                    + {tag}
                  </button>
                ))}

                {/* Custom Tags */}
                {wizardForm.tags.filter(t => !QUICK_TAGS.includes(t)).map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className="text-[10px] px-2 py-1 rounded-full border bg-accent-primary border-accent-primary text-white transition-colors">
                    + {tag} ×
                  </button>
                ))}

                {/* Add Custom Tag Input */}
                <div className="flex items-center space-x-1 ml-1 my-2">
                  <input
                    type="text"
                    placeholder="Custom tag..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customTagInput.trim()) {
                        e.preventDefault();
                        if (!wizardForm.tags.includes(customTagInput.trim())) {
                          toggleTag(customTagInput.trim());
                        }
                        setCustomTagInput('');
                      }
                    }}
                    className="bg-transparent border-b border-border-default text-[10px] text-text-secondary outline-none focus:border-accent-primary w-20 px-1 py-0.5 placeholder:text-text-faint"
                  />
                  {customTagInput.trim() && (
                    <button
                      onClick={() => {
                        if (!wizardForm.tags.includes(customTagInput.trim())) {
                          toggleTag(customTagInput.trim());
                        }
                        setCustomTagInput('');
                      }}
                      className="text-[10px] text-accent-primary-text font-bold px-1"
                    >
                      Add
                    </button>
                  )}
                </div>
                </div>
              </div>
            </div>

            {/* Live Prediction Gauge */}
            <div className="bg-bg-surface p-5 rounded-2xl border border-subtle relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 w-full bg-bg-raised">
                <div className={`h-full transition-all duration-500 ${getGaugeColor(predictedColumn)}`} style={{width: `${Math.min((currentScore / 40) * 100, 100)}%`}}></div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-[10px] text-text-faint uppercase tracking-widest font-bold mb-1">Calculated Tier</p>
                  <p className={`text-xl font-black uppercase ${predictedColumn === 'High' ? 'text-accent-primary' : predictedColumn === 'Med' ? 'text-priority-med-text' : predictedColumn === 'Later' ? 'text-text-faint' : 'text-priority-low-text'}`}>
                    {predictedColumn} Priority
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-text-primary">{currentScore}</span>
                  <span className="text-xs text-text-faint ml-1 block">RICE Pts</span>
                </div>
              </div>
            </div>

            {/* MoSCoW Toggles */}
            <div>
              <label className="text-[10px] text-text-faint font-bold uppercase tracking-widest mb-2 block">MoSCoW Filter (Overrides RICE)</label>
              <div className="flex bg-bg-surface rounded-xl p-1 border border-subtle">
                {['Must', 'Should', 'Could', "Won't"].map(m => (
                  <button
                    key={m} onClick={() => setWizardForm({...wizardForm, moscow: m})}
                    className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${wizardForm.moscow === m ? (m === 'Must' ? 'bg-accent-primary-dark text-white' : m === "Won't" ? 'bg-bg-overlay text-text-secondary' : 'bg-bg-raised text-white shadow-md') : 'text-text-faint hover:text-text-secondary'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* RICE Sliders (Fibonacci) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-1">
                <label className="text-[10px] text-text-faint font-bold uppercase tracking-widest block">RICE Estimation (Fibonacci Scale)</label>
                <button onClick={() => setWizardForm({...wizardForm, infoOpen: wizardForm.infoOpen === 'fibonacci' ? null : 'fibonacci'})} className="text-text-faint hover:text-accent-secondary-text transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {wizardForm.infoOpen === 'fibonacci' && (
                <div className="mb-2 text-[10px] text-text-secondary bg-bg-raised p-3 rounded-lg border border-border-default relative">
                  <div className="absolute -top-1 left-[150px] w-2 h-2 bg-bg-raised border-t border-l border-border-default transform rotate-45"></div>
                  <span className="font-bold text-accent-secondary-text block mb-0.5">Why jump? (1, 2, 3, 5, 8)</span>
                  <span className="text-text-secondary">As tasks get bigger, they get harder to estimate. This scale removes "false precision". If it feels bigger than a 3, jump to 5 to avoid debating small differences.</span>
                </div>
              )}

              {['reach', 'impact', 'confidence', 'effort'].map(metric => (
                <div key={metric} className="bg-bg-surface p-4 rounded-2xl border border-subtle">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-bold text-text-primary capitalize">{metric}</label>
                      <button onClick={() => setWizardForm({...wizardForm, infoOpen: wizardForm.infoOpen === metric ? null : metric})} className="text-text-faint hover:text-accent-secondary-text transition-colors">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-accent-secondary-text font-black text-lg">{wizardForm[metric]}</span>
                  </div>

                  {wizardForm.infoOpen === metric && (
                    <div className="mb-4 text-[10px] text-text-secondary bg-bg-raised p-3 rounded-lg border border-border-default relative">
                      <div className="absolute -top-1 left-20 w-2 h-2 bg-bg-raised border-t border-l border-border-default transform rotate-45"></div>
                      <span className="font-bold text-accent-secondary-text block mb-0.5">{RICE_HINTS[metric].title}</span>
                      <span className="text-text-secondary">{RICE_HINTS[metric].desc}</span>
                    </div>
                  )}

                  <div className="flex justify-between relative before:absolute before:top-1/2 before:left-4 before:right-4 before:h-0.5 before:bg-bg-raised before:-z-0">
                    {FIBONACCI.map(val => (
                      <button
                        key={val} onClick={() => setWizardForm({...wizardForm, [metric]: val})}
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${wizardForm[metric] === val ? 'bg-accent-secondary text-text-inverted scale-110' : 'bg-bg-surface border-2 border-border-default text-text-muted hover:border-border-strong'}`}
                        style={wizardForm[metric] === val ? { boxShadow: `0 0 15px var(--shadow-selected)` } : undefined}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Save Button */}
          <div className="pt-4 bg-bg-base border-t border-subtle absolute bottom-0 left-0 w-full px-4 pb-safe-bottom z-50">
            <button onClick={saveWizard} className="w-full bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-black text-lg py-4 rounded-2xl active:scale-95 transition-transform mb-4" style={{ boxShadow: `0 4px 20px var(--accent-primary-shadow)` }}>
              Commit to {predictedColumn} Priority
            </button>
          </div>
        </div>
      )}

      {/* --- GOAL CRUSHED TOAST --- */}
      {goalToast && (
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-bg-surface border border-accent-primary rounded-2xl py-12 px-12 flex justify-center" style={{ boxShadow: `0 0 30px var(--shadow-toast)` }}>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-7xl">🥳</h2>
              <h2 className="text-3xl mt-3 font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-tertiary-alt text-center">
                Task Complete!
              </h2>
              <p className="text-text-secondary mt-3 font-bold text-center">Way to go!</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
