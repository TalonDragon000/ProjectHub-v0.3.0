import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storage } from '../storage/index.js';
import { calculateScore, predictColumn } from '../lib/rice.js';
import { fireConfetti } from '../lib/colors.js';
import { COLUMNS } from '../constants.js';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

const EMPTY_WIZARD = {
  title: '', description: '', reach: 3, impact: 3, confidence: 3, effort: 3,
  moscow: 'Should', infoOpen: null, tags: [],
  specs: {who: '', what: '', why: '' }
};

const sortByRice = (taskList) =>
  [...taskList].sort((a, b) => {
    const sa = parseFloat(calculateScore(a.reach, a.impact, a.confidence, a.effort));
    const sb = parseFloat(calculateScore(b.reach, b.impact, b.confidence, b.effort));
    return sb - sa;
  });

export function AppProvider({ children }) {
  // --- Core data ---
  const [projects, setProjectsState] = useState(() => storage.getProjects());
  const [tasks, setTasksState] = useState(() => storage.getTasks());
  const [activeProjectId, setActiveProjectId] = useState(
    () => storage.getProjects()[0]?.id ?? null
  );

  // --- Navigation ---
  const [activeTab, setActiveTab] = useState('home');
  const [activeColIndex, setActiveColIndex] = useState(0);

  // --- Modal visibility ---
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [goalToast, setGoalToast] = useState(false);

  // --- View task modal ---
  const [viewTaskOpen, setViewTaskOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);

  // --- Project edit modal ---
  const [projectEditOpen, setProjectEditOpen] = useState(false);

  // --- Wizard form ---
  const [wizardForm, setWizardForm] = useState(EMPTY_WIZARD);
  const [customTagInput, setCustomTagInput] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // --- Project form ---
  const [projectForm, setProjectForm] = useState({ name: '', mission: '' });

  // --- Quick note ---
  const [quickNoteText, setQuickNoteText] = useState('');

  // --- Swipe refs ---
  const touchStartX = useRef(0);

  // --- Persist to storage on change ---
  const setProjects = (data) => {
    const next = typeof data === 'function' ? data(projects) : data;
    setProjectsState(next);
    storage.saveProjects(next);
  };

  const setTasks = (data) => {
    const next = typeof data === 'function' ? data(tasks) : data;
    setTasksState(next);
    storage.saveTasks(next);
  };

  // --- Derived ---
  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const activeTasks = sortByRice(
    projectTasks.filter(t => t.column === COLUMNS[activeColIndex] && !t.completed)
  );
  const completedTasks = projectTasks.filter(t => t.completed);
  const nowTasks = projectTasks.filter(t => t.column === 'High' && !t.completed);
  const nextTasks = projectTasks.filter(t => (t.column === 'Med' || t.column === 'Low') && !t.completed);

  const currentScore = calculateScore(wizardForm.reach, wizardForm.impact, wizardForm.confidence, wizardForm.effort);
  const predictedColumn = predictColumn(currentScore, wizardForm.moscow);

  // --- Swipe handlers ---
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && activeColIndex < COLUMNS.length - 1) setActiveColIndex(c => c + 1);
    if (diff < -50 && activeColIndex > 0) setActiveColIndex(c => c - 1);
  };

  // --- Actions ---
  const openWizard = (task = null) => {
    setGlobalMenuOpen(false);
    setViewTaskOpen(false);
    setCustomTagInput('');
    if (task) {
      setEditingTask(task.id);
      setWizardForm({ ...EMPTY_WIZARD, ...task, infoOpen: null });
    } else {
      setEditingTask(null);
      setWizardForm(EMPTY_WIZARD);
    }
    setWizardOpen(true);
  };

const saveWizard = () => {
  const score = calculateScore(wizardForm.reach, wizardForm.impact, wizardForm.confidence, wizardForm.effort);
  const col = predictColumn(score, wizardForm.moscow);
  const updatedFields = { ...wizardForm, column: col };

  if (editingTask) {
    setTasks(prev => prev.map(t =>
      t.id === editingTask ? { ...t, ...updatedFields } : t
    ));
    if (viewingTask?.id === editingTask) {
      setViewingTask(prev => ({ ...prev, ...updatedFields }));
    }
  } else {
    setTasks(prev => [
      ...prev,
      { id: Date.now(), projectId: activeProjectId, ...updatedFields, completed: false },
    ]);
  }
  setWizardOpen(false);
};

  const openViewTask = (task) => {
    setViewingTask(task);
    setViewTaskOpen(true);
  };

  const closeViewTask = () => {
    setViewTaskOpen(false);
    setViewingTask(null);
  };

  const saveQuickNote = () => {
    if (!quickNoteText.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(), projectId: activeProjectId, title: quickNoteText,
      description: '',
      reach: 3, impact: 3, confidence: 3, effort: 3, moscow: 'Should',
      column: 'To Sort', completed: false, tags: [],
    }]);
    setQuickNoteText('');
    setQuickNoteOpen(false);
    setActiveTab('tasks');
    setActiveColIndex(4);
  };

  const updateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const openProjectEdit = () => setProjectEditOpen(true);
  const closeProjectEdit = () => setProjectEditOpen(false);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject = { id: Date.now(), specs: { who: '', what: '', why: '' }, ...projectForm };
    setProjects(prev => [...prev, newProject]);
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
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTask = (updatedTask) => {
  setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  // Keep viewingTask fresh so ViewModal reflects the save immediately
  if (viewingTask?.id === updatedTask.id) {
    setViewingTask(updatedTask);
  }
};

  const toggleTag = (tag) => {
    setWizardForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  useEffect(() => {
    if (projects.length === 0) setOnboardingOpen(true);
  }, [projects]);

  const value = {
    // Data
    projects, tasks, activeProjectId, setActiveProjectId,
    activeProject, projectTasks, activeTasks, completedTasks, nowTasks, nextTasks,
    // Navigation
    activeTab, setActiveTab, activeColIndex, setActiveColIndex,
    // Modals
    onboardingOpen, setOnboardingOpen,
    vaultOpen, setVaultOpen,
    globalMenuOpen, setGlobalMenuOpen,
    wizardOpen, setWizardOpen,
    quickNoteOpen, setQuickNoteOpen,
    goalToast,
    // View task
    viewTaskOpen, viewingTask, openViewTask, closeViewTask,
    // Project edit
    projectEditOpen, openProjectEdit, closeProjectEdit, updateProject,
    // Wizard
    wizardForm, setWizardForm, customTagInput, setCustomTagInput, editingTask,
    currentScore, predictedColumn,
    // Project form
    projectForm, setProjectForm,
    // Quick note
    quickNoteText, setQuickNoteText,
    // Gesture handlers
    handleTouchStart, handleTouchEnd,
    // Actions
    openWizard, saveWizard, saveQuickNote, createProject, completeTask, deleteTask, updateTask, toggleTag,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
