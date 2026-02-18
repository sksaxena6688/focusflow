// storage.js — localStorage CRUD helpers for all FocusFlow data types

const KEYS = {
  habits: 'ff_habits',
  habitLogs: 'ff_habit_logs',
  tasks: 'ff_tasks',
  sessions: 'ff_sessions',
  notes: 'ff_notes',
  resources: 'ff_resources',
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

// ── Habits ──────────────────────────────────────────────────────────────────
export const getHabits = () => read(KEYS.habits);
export const saveHabits = (d) => write(KEYS.habits, d);
export const addHabit = (h) => { const a = getHabits(); a.push({ ...h, id: uid(), createdAt: now() }); saveHabits(a); };
export const updateHabit = (id, u) => saveHabits(getHabits().map(h => h.id === id ? { ...h, ...u } : h));
export const deleteHabit = (id) => { saveHabits(getHabits().filter(h => h.id !== id)); saveHabitLogs(getHabitLogs().filter(l => l.habitId !== id)); };

// ── Habit Logs ───────────────────────────────────────────────────────────────
export const getHabitLogs = () => read(KEYS.habitLogs);
export const saveHabitLogs = (d) => write(KEYS.habitLogs, d);
export const isHabitDone = (hId, date) => getHabitLogs().some(l => l.habitId === hId && l.date === date);
export const toggleHabitLog = (hId, date) => {
  const logs = getHabitLogs();
  const exists = logs.find(l => l.habitId === hId && l.date === date);
  exists
    ? saveHabitLogs(logs.filter(l => !(l.habitId === hId && l.date === date)))
    : saveHabitLogs([...logs, { habitId: hId, date, completedAt: now() }]);
};

// ── Tasks ────────────────────────────────────────────────────────────────────
export const getTasks = () => read(KEYS.tasks);
export const saveTasks = (d) => write(KEYS.tasks, d);
export const addTask = (t) => { const a = getTasks(); a.push({ ...t, id: uid(), createdAt: now(), completed: false }); saveTasks(a); };
export const updateTask = (id, u) => saveTasks(getTasks().map(t => t.id === id ? { ...t, ...u } : t));
export const deleteTask = (id) => saveTasks(getTasks().filter(t => t.id !== id));
export const toggleTask = (id) => updateTask(id, { completed: !getTasks().find(t => t.id === id)?.completed, updatedAt: now() });

// ── Study Sessions ───────────────────────────────────────────────────────────
export const getSessions = () => read(KEYS.sessions);
export const saveSessions = (d) => write(KEYS.sessions, d);
export const addSession = (s) => { const a = getSessions(); a.push({ ...s, id: uid(), createdAt: now() }); saveSessions(a); };
export const deleteSession = (id) => saveSessions(getSessions().filter(s => s.id !== id));

// ── Notes ────────────────────────────────────────────────────────────────────
export const getNotes = () => read(KEYS.notes);
export const saveNotes = (d) => write(KEYS.notes, d);
export const addNote = (n) => { const a = getNotes(); a.unshift({ ...n, id: uid(), createdAt: now(), updatedAt: now() }); saveNotes(a); };
export const updateNote = (id, u) => saveNotes(getNotes().map(n => n.id === id ? { ...n, ...u, updatedAt: now() } : n));
export const deleteNote = (id) => saveNotes(getNotes().filter(n => n.id !== id));

// ── Resources ────────────────────────────────────────────────────────────────
export const getResources = () => read(KEYS.resources);
export const saveResources = (d) => write(KEYS.resources, d);
export const addResource = (r) => { const a = getResources(); a.push({ ...r, id: uid(), createdAt: now() }); saveResources(a); };
export const updateResource = (id, u) => saveResources(getResources().map(r => r.id === id ? { ...r, ...u } : r));
export const deleteResource = (id) => saveResources(getResources().filter(r => r.id !== id));
