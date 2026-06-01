import { localStorageAdapter } from './localStorageAdapter.js';
import { supabaseAdapter } from './supabaseAdapter.js';

let syncEnabled = false;

export function enableSync() {
  syncEnabled = true;
}

export function disableSync() {
  syncEnabled = false;
}

export function isSyncEnabled() {
  return syncEnabled;
}

function backgroundSync(fn) {
  if (!syncEnabled) return;
  fn().catch((err) => {
    console.warn('[sync] background sync failed:', err.message);
  });
}

export const storage = {
  getProjects() {
    return localStorageAdapter.getProjects();
  },

  saveProjects(projects) {
    localStorageAdapter.saveProjects(projects);
    backgroundSync(() => supabaseAdapter.saveProjects(projects));
  },

  getTasks() {
    return localStorageAdapter.getTasks();
  },

  saveTasks(tasks) {
    localStorageAdapter.saveTasks(tasks);
    backgroundSync(() => supabaseAdapter.saveTasks(tasks));
  },
};

export async function pullFromCloud() {
  if (!syncEnabled) return null;

  const remoteUpdatedAt = await supabaseAdapter.getUpdatedAt();
  if (!remoteUpdatedAt) return null;

  const localTimestamp = localStorage.getItem('projecthub_sync_ts');
  if (localTimestamp && new Date(localTimestamp) >= new Date(remoteUpdatedAt)) {
    return null;
  }

  const projects = await supabaseAdapter.getProjects();
  const tasks = await supabaseAdapter.getTasks();

  localStorageAdapter.saveProjects(projects);
  localStorageAdapter.saveTasks(tasks);
  localStorage.setItem('projecthub_sync_ts', remoteUpdatedAt);

  return { projects, tasks };
}

export async function pushToCloud(projects, tasks) {
  if (!syncEnabled) return;
  await supabaseAdapter.saveFullState(projects, tasks);
  localStorage.setItem('projecthub_sync_ts', new Date().toISOString());
}
