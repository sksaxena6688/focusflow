// storage.js — centralized localStorage CRUD helpers for FocusFlow
// All reads are safe-parsed with fallback. No scattered localStorage calls elsewhere.

const KEYS = {
  habits: 'ff_habits',
  habitLogs: 'ff_habit_logs',
  tasks: 'ff_tasks',
  // Legacy key — migrated to completedSessions on first read
  sessions: 'ff_sessions',
  // New session state keys
  scheduledSessions: 'ff_scheduled_sessions',
  activeSession: 'ff_active_session',
  completedSessions: 'ff_completed_sessions',
  // Persistent timer state (timestamp-based)
  activeTimer: 'ff_active_timer',
  notes: 'ff_notes',
  resources: 'ff_resources',
};

// ── Core helpers ─────────────────────────────────────────────────────────────

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota exceeded */ }
}

function uid() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }

// ── Backward migration ────────────────────────────────────────────────────────
// Old ff_sessions → ff_completed_sessions (runs once, idempotent)
function migrateOldSessions() {
  const old = read(KEYS.sessions, null);
  if (old === null) return; // already migrated or never existed
  const existing = read(KEYS.completedSessions, []);
  const existingIds = new Set(existing.map(s => s.id));
  const toMigrate = old.filter(s => !existingIds.has(s.id))
    .map(s => ({ ...s, status: 'completed', completedAt: s.createdAt || now() }));
  if (toMigrate.length > 0) {
    write(KEYS.completedSessions, [...existing, ...toMigrate]);
  }
  // Remove old key so migration doesn't run again
  localStorage.removeItem(KEYS.sessions);
}

// Run migration immediately on module load
migrateOldSessions();

// ── Habits ───────────────────────────────────────────────────────────────────
export const getHabits = () => read(KEYS.habits);
export const saveHabits = (d) => write(KEYS.habits, d);
export const addHabit = (h) => {
  const a = getHabits();
  a.push({ ...h, id: uid(), createdAt: now() });
  saveHabits(a);
};
export const updateHabit = (id, u) =>
  saveHabits(getHabits().map(h => h.id === id ? { ...h, ...u } : h));
export const deleteHabit = (id) => {
  saveHabits(getHabits().filter(h => h.id !== id));
  saveHabitLogs(getHabitLogs().filter(l => l.habitId !== id));
};

// ── Habit Logs ───────────────────────────────────────────────────────────────
export const getHabitLogs = () => read(KEYS.habitLogs);
export const saveHabitLogs = (d) => write(KEYS.habitLogs, d);
export const isHabitDone = (hId, date) =>
  getHabitLogs().some(l => l.habitId === hId && l.date === date);
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
export const addTask = (t) => {
  const a = getTasks();
  a.push({ ...t, id: uid(), createdAt: now(), completed: false });
  saveTasks(a);
};
export const updateTask = (id, u) =>
  saveTasks(getTasks().map(t => t.id === id ? { ...t, ...u } : t));
export const deleteTask = (id) => saveTasks(getTasks().filter(t => t.id !== id));
export const toggleTask = (id) =>
  updateTask(id, { completed: !getTasks().find(t => t.id === id)?.completed, updatedAt: now() });

// ── Scheduled Sessions ────────────────────────────────────────────────────────
// Sessions that are planned but NOT started. Do NOT affect analytics.
export const getScheduledSessions = () => read(KEYS.scheduledSessions);
export const saveScheduledSessions = (d) => write(KEYS.scheduledSessions, d);
export const addScheduledSession = (s) => {
  const a = getScheduledSessions();
  a.push({ ...s, id: uid(), status: 'scheduled', createdAt: now() });
  saveScheduledSessions(a);
};
export const deleteScheduledSession = (id) =>
  saveScheduledSessions(getScheduledSessions().filter(s => s.id !== id));
export const updateScheduledSession = (id, u) =>
  saveScheduledSessions(getScheduledSessions().map(s => s.id === id ? { ...s, ...u } : s));

// ── Active Session ────────────────────────────────────────────────────────────
// At most ONE session is active at a time. Stored as a single object (not array).
export const getActiveSession = () => read(KEYS.activeSession, null);
export const saveActiveSession = (s) => write(KEYS.activeSession, s);
export const clearActiveSession = () => localStorage.removeItem(KEYS.activeSession);

// Start a session from a scheduled one (removes from scheduled, sets as active)
export const startScheduledSession = (scheduledId) => {
  const scheduled = getScheduledSessions().find(s => s.id === scheduledId);
  if (!scheduled) return null;
  const active = { ...scheduled, status: 'active', startedAt: now(), laps: [] };
  saveActiveSession(active);
  deleteScheduledSession(scheduledId);
  return active;
};

// Start a brand-new ad-hoc session (not from scheduled list)
export const startAdHocSession = (data) => {
  const active = {
    ...data,
    id: uid(),
    status: 'active',
    startedAt: now(),
    laps: [],
    createdAt: now(),
  };
  saveActiveSession(active);
  return active;
};

// ── Persistent Timer State ────────────────────────────────────────────────────
// Stored separately from session metadata for clean separation.
// Shape: { status, startTimestamp, accumulatedSeconds, pausedAt }
export const getTimerState = () => read(KEYS.activeTimer, null);
export const saveTimerState = (t) => write(KEYS.activeTimer, t);
export const clearTimerState = () => localStorage.removeItem(KEYS.activeTimer);

// ── Completed Sessions ────────────────────────────────────────────────────────
// THE ONLY source of truth for analytics.
export const getCompletedSessions = () => read(KEYS.completedSessions);
export const saveCompletedSessions = (d) => write(KEYS.completedSessions, d);

// Move active session to completed, attaching final duration in minutes
export const completeActiveSession = (durationSeconds, laps = []) => {
  const active = getActiveSession();
  if (!active) return null;
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
  const completed = {
    ...active,
    status: 'completed',
    duration: durationMinutes,
    durationSeconds,
    laps,
    completedAt: now(),
  };
  const all = getCompletedSessions();
  all.push(completed);
  saveCompletedSessions(all);
  clearActiveSession();
  clearTimerState();
  return completed;
};

export const deleteCompletedSession = (id) =>
  saveCompletedSessions(getCompletedSessions().filter(s => s.id !== id));

// ── Legacy getSessions (backward compat for any remaining callers) ─────────────
// Returns completed sessions — same as getCompletedSessions()
export const getSessions = getCompletedSessions;
export const addSession = (s) => {
  const a = getCompletedSessions();
  a.push({ ...s, id: uid(), status: 'completed', completedAt: now(), createdAt: now() });
  saveCompletedSessions(a);
};
export const deleteSession = deleteCompletedSession;

// ── Notes ────────────────────────────────────────────────────────────────────
export const getNotes = () => read(KEYS.notes);
export const saveNotes = (d) => write(KEYS.notes, d);
export const addNote = (n) => {
  const a = getNotes();
  a.unshift({ ...n, id: uid(), createdAt: now(), updatedAt: now() });
  saveNotes(a);
};
export const updateNote = (id, u) =>
  saveNotes(getNotes().map(n => n.id === id ? { ...n, ...u, updatedAt: now() } : n));
export const deleteNote = (id) => saveNotes(getNotes().filter(n => n.id !== id));

// ── Resources ────────────────────────────────────────────────────────────────
// Schema additions: currentPage (number), totalPages (number), fileName (string)
// Progress % is auto-calculated from currentPage/totalPages when both present.
export const getResources = () => read(KEYS.resources);
export const saveResources = (d) => write(KEYS.resources, d);
export const addResource = (r) => {
  const a = getResources();
  a.push({ ...r, id: uid(), createdAt: now() });
  saveResources(a);
};
export const updateResource = (id, u) =>
  saveResources(getResources().map(r => r.id === id ? { ...r, ...u } : r));
export const deleteResource = (id) =>
  saveResources(getResources().filter(r => r.id !== id));

// Helper: compute progress % for a resource
export function getResourceProgress(r) {
  if (r.type === 'PDF' && r.totalPages > 0 && r.currentPage >= 0) {
    return Math.min(100, Math.round((r.currentPage / r.totalPages) * 100));
  }
  return Math.min(100, Number(r.progress) || 0);
}
