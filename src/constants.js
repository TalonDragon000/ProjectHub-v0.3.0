export const COLUMNS = ['High', 'Med', 'Low', 'Later', 'To Sort'];

export const FIBONACCI = [1, 2, 3, 5, 8];

export const QUICK_TAGS = ['Marketing', 'Engagement', 'Maintenance', 'Feature', 'Bug Fix'];

export const RICE_HINTS = {
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

export const DEMO_PROJECT = { id: 1, name: 'Demo Project', mission: 'A sample setup for you to explore the app.', specs: { who: 'Founders & product teams', what: 'A mobile prioritization tool', why: 'Too many tasks, not enough clarity' }, pinned: false, archived: false };

export const DEMO_TASKS = [
  { id: 1, projectId: 1, title: 'Swipe to view next column', description: 'Swipe left or right on the task list to navigate between priority columns.', reach: 5, impact: 8, confidence: 5, effort: 3, moscow: 'Must', column: 'High', completed: false, tags: ['Feature'] },
  { id: 2, projectId: 1, title: 'Click "..." to open task options', description: 'Hover over a card and click the menu button to view, prioritize, complete, or delete a task.', reach: 8, impact: 5, confidence: 8, effort: 5, moscow: 'Should', column: 'Med', completed: false, tags: ['Marketing'] },
  { id: 3, projectId: 1, title: 'Complete task to archive', description: 'Completed tasks are moved to the Dev Log for future reference.', reach: 8, impact: 3, confidence: 3, effort: 8, moscow: 'Could', column: 'Low', completed: false, tags: ['Maintenance'] },
];
