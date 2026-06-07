import React, { lazy, Suspense, useEffect } from 'react';
import { useApp } from './context/AppContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { enableSync, disableSync, pullFromCloud, pushToCloud } from './storage/index.js';

import AppHeader from './components/AppHeader.jsx';
import BottomNav from './components/BottomNav.jsx';
import GlobalMenu from './components/GlobalMenu.jsx';
import GoalToast from './components/GoalToast.jsx';

import HomeDashboard from './views/HomeDashboard.jsx';
import TasksWorkspace from './views/TasksWorkspace.jsx';
import AuthPage from './views/AuthPage.jsx';

// OnboardingModal is eager — it is the first screen new users see.
import OnboardingModal from './components/modals/OnboardingModal.jsx';

// All other modals are lazy — they are only needed after the user interacts.
const PriorityWizard   = lazy(() => import('./components/modals/PriorityWizard.jsx'));
const QuickNoteModal   = lazy(() => import('./components/modals/QuickNoteModal.jsx'));
const VaultModal       = lazy(() => import('./components/modals/VaultModal.jsx'));
const TaskViewModal    = lazy(() => import('./components/modals/TaskViewModal.jsx'));
const ProjectEditModal = lazy(() => import('./components/modals/ProjectEditModal.jsx'));
const RecoveryKeyModal = lazy(() => import('./components/modals/RecoveryKeyModal.jsx'));
const UnlockModal      = lazy(() => import('./components/modals/UnlockModal.jsx'));
const ProfileModal     = lazy(() => import('./components/modals/ProfileModal.jsx'));

export default function App() {
  const { activeTab, handleTouchStart, handleTouchEnd, setProjects, setTasks } = useApp();
  const {
    isAuthenticated, isUnlocked, isGuest,
    needsSetup, needsUnlock,
    loading,
    continueAsGuest, dismissAuth,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isUnlocked) {
      enableSync();
      pullFromCloud().then((data) => {
        if (data) {
          setProjects(data.projects);
          setTasks(data.tasks);
        }
      }).catch(() => {});
    } else {
      disableSync();
    }
  }, [isAuthenticated, isUnlocked, setProjects, setTasks]);

  const handleRecoveryComplete = () => {
    const projects = JSON.parse(localStorage.getItem('projecthub_projects') || '[]');
    const tasks = JSON.parse(localStorage.getItem('projecthub_tasks') || '[]');
    pushToCloud(projects, tasks).catch(() => {});
  };

  const handleUnlocked = () => {
    pullFromCloud().then((data) => {
      if (data) {
        setProjects(data.projects);
        setTasks(data.tasks);
      }
    }).catch(() => {});
  };

  // While Supabase resolves the existing session, show a branded splash
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto h-screen bg-base flex items-center justify-center font-sans">
        <div className="text-center">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-tertiary-alt to-accent-primary mb-4">
            Project Hub
          </h1>
          <div className="w-6 h-6 border-2 border-accent-tertiary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Unauthenticated and not in guest mode — show auth gate
  if (!isAuthenticated && !isGuest) {
    return <AuthPage onGuest={continueAsGuest} />;
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-base text-primary flex flex-col font-sans relative overflow-hidden select-none">

      <AppHeader />

      <main
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'tasks' && <TasksWorkspace />}
      </main>

      <BottomNav />
      <GlobalMenu />

      <OnboardingModal />

      <Suspense fallback={null}>
        <QuickNoteModal />
        <VaultModal />
        <PriorityWizard />
        <TaskViewModal />
        <ProjectEditModal />
        <ProfileModal />
        {needsSetup && <RecoveryKeyModal onComplete={handleRecoveryComplete} />}
        {needsUnlock && <UnlockModal onUnlocked={handleUnlocked} onDismiss={dismissAuth} />}
      </Suspense>

      <GoalToast />

    </div>
  );
}
