import { localStorageAdapter } from './localStorageAdapter.js';

let syncEnabled = false;

// Lazily resolved — only imported after the user authenticates and
// enableSync() is called. This keeps crypto.js and compress.js out
// of the initial bundle entirely.
let _supabaseAdapter = null;
async function getAdapter() {
  if (!_supabaseAdapter) {
    const mod = await import('./supabaseAdapter.js');
    _supabaseAdapter = mod.supabaseAdapter;
  }
  return _supabaseAdapter;
}

export function enableSync() {
  syncEnabled = true;
  // Kick off the import immediately so it's ready by the time the first
  // save comes in — avoids a waterfall on the very first write.
  getAdapter().catch(() => {});
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
    backgroundSync(async () => (await getAdapter()).saveProjects(projects));
  },

  getTasks() {
    return localStorageAdapter.getTasks();
  },

  saveTasks(tasks) {
    localStorageAdapter.saveTasks(tasks);
    backgroundSync(async () => (await getAdapter()).saveTasks(tasks));
  },
};

export async function pullFromCloud() {
  if (!syncEnabled) return null;
  const adapter = await getAdapter();

  const remoteUpdatedAt = await adapter.getUpdatedAt();
  if (!remoteUpdatedAt) return null;

  const localTimestamp = localStorage.getItem('projecthub_sync_ts');
  if (localTimestamp && new Date(localTimestamp) >= new Date(remoteUpdatedAt)) {
    return null;
  }

  const projects = await adapter.getProjects();
  const tasks = await adapter.getTasks();

  localStorageAdapter.saveProjects(projects);
  localStorageAdapter.saveTasks(tasks);
  localStorage.setItem('projecthub_sync_ts', remoteUpdatedAt);

  return { projects, tasks };
}

export async function pushToCloud(projects, tasks) {
  if (!syncEnabled) return;
  const adapter = await getAdapter();
  await adapter.saveFullState(projects, tasks);
  localStorage.setItem('projecthub_sync_ts', new Date().toISOString());
}
