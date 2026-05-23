const KEYS = {
  projects: 'projecthub_projects',
  tasks:    'projecthub_tasks',
};

const parse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const localStorageAdapter = {
  getProjects: () => parse(KEYS.projects, []),
  saveProjects: (data) => localStorage.setItem(KEYS.projects, JSON.stringify(data)),
  getTasks: () => parse(KEYS.tasks, []),
  saveTasks: (data) => localStorage.setItem(KEYS.tasks, JSON.stringify(data)),
};
