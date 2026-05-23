import React from 'react';
import { useApp } from './context/AppContext.jsx';

import AppHeader from './components/AppHeader.jsx';
import BottomNav from './components/BottomNav.jsx';
import GlobalMenu from './components/GlobalMenu.jsx';
import GoalToast from './components/GoalToast.jsx';

import HomeDashboard from './views/HomeDashboard.jsx';
import TasksWorkspace from './views/TasksWorkspace.jsx';

import PriorityWizard from './components/modals/PriorityWizard.jsx';
import QuickNoteModal from './components/modals/QuickNoteModal.jsx';
import VaultModal from './components/modals/VaultModal.jsx';
import OnboardingModal from './components/modals/OnboardingModal.jsx';
import TaskViewModal from './components/modals/TaskViewModal.jsx';
import ProjectEditModal from './components/modals/ProjectEditModal.jsx';

export default function App() {
  const { activeTab, handleTouchStart, handleTouchEnd } = useApp();

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

      <QuickNoteModal />
      <OnboardingModal />
      <VaultModal />
      <PriorityWizard />
      <TaskViewModal />
      <ProjectEditModal />

      <GoalToast />

    </div>
  );
}
