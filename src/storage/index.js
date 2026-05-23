// Active storage adapter. Swap this import to change the backend.
// All adapters must implement: getProjects, saveProjects, getTasks, saveTasks.
export { localStorageAdapter as storage } from './localStorageAdapter.js';

// Future adapters (uncomment to activate after auth is wired):
// export { supabaseAdapter as storage } from './supabaseAdapter.js';
