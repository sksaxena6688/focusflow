// StudyTracker.jsx — three-state session system: Scheduled → Active → Completed
// Analytics ONLY reads completedSessions. Scheduled sessions never affect analytics.
// Timer hook is called ONCE at the top level and passed down — no dual-hook conflicts.
import { useState, useCallback, useEffect } from 'react';
import {
    Plus, Play, Pause, Square, Flag, Trash2,
    BookOpen, Timer, CheckCircle2, Calendar
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import Card, { CardHeader } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { useStudyTimer } from '../hooks/useStudyTimer';
import {
    getScheduledSessions, addScheduledSession, deleteScheduledSession,
    getCompletedSessions, deleteCompletedSession,
    getActiveSession, startScheduledSession, startAdHocSession,
    clearActiveSession, clearTimerState, getResources,
} from '../utils/storage';
import { today, formatDate, formatDuration } from '../utils/dateHelpers';

const BLANK_SCHEDULE = { subject: '', date: today(), notes: '', linkedResourceId: '' };

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        scheduled: { label: 'Scheduled', cls: 'bg-gray-100 text-gray-600' },
        active: { label: 'Active', cls: 'bg-blue-50 text-[#2C4A7C]' },
        completed: { label: 'Completed', cls: 'bg-[#EBF5EE] text-[#4A7C59]' },
    };
    const { label, cls } = map[status] || map.scheduled;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase ${cls}`}>
            {label}
        </span>
    );
}

// ── Lap list ──────────────────────────────────────────────────────────────────
function LapList({ laps, format }) {
    if (!laps || laps.length === 0) return null;
    return (
        <div className="mt-3 border-t border-[#F0EEE9] pt-3">
            <div className="text-xs font-semibold text-[#7A7A8A] mb-2 uppercase tracking-wide">Laps</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
                {laps.map((lap) => (
                    <div key={lap.id} className="flex justify-between text-xs text-[#4A4A5A]">
                        <span className="text-[#7A7A8A]">Lap {lap.lapNumber}</span>
                        <span className="font-mono font-medium">{format(lap.elapsed)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Active session panel — receives timer props from parent ───────────────────
// ── Active session panel — receives timer props from parent ───────────────────
function ActivePanel({ activeSession, timer, onStop, onReset }) {
    const { elapsed, status, laps, pause, resume, stop, addLap, format, targetSeconds } = timer;
    const [mode, setMode] = useState(targetSeconds ? 'remaining' : 'elapsed');

    // Auto-switch to remaining if targetSeconds becomes available (e.g. on load)
    useEffect(() => {
        if (targetSeconds && mode === 'elapsed') setMode('remaining');
    }, [targetSeconds]);

    const displaySeconds = (mode === 'remaining' && targetSeconds)
        ? Math.max(0, targetSeconds - elapsed)
        : elapsed;

    const toggleMode = () => {
        if (!targetSeconds) return;
        setMode(m => m === 'elapsed' ? 'remaining' : 'elapsed');
    };

    const handleStop = () => {
        const completed = stop();
        onStop(completed);
    };

    const handleReset = () => {
        if (!confirm('Discard this session without saving?')) return;
        clearActiveSession();
        clearTimerState();
        onReset();
    };

    const resource = activeSession?.linkedResourceId
        ? getResources().find(r => r.id === activeSession.linkedResourceId)
        : null;

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-[#2C4A7C] animate-pulse' : 'bg-amber-400'}`} />
                        <StatusBadge status="active" />
                    </div>
                    <h3 className="text-base font-semibold text-[#1A1A2E]">
                        {activeSession?.subject || 'Study Session'}
                    </h3>
                    {resource && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <BookOpen size={11} className="text-[#7A7A8A]" />
                            <span className="text-xs text-[#7A7A8A]">{resource.title}</span>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <div
                        onClick={toggleMode}
                        className={`text-4xl font-bold tabular-nums tracking-tight cursor-pointer select-none transition-colors hover:opacity-80 ${status === 'running' ? 'text-[#2C4A7C]' : 'text-[#1A1A2E]'}`}
                        title={targetSeconds ? "Click to toggle Remaining/Elapsed" : "Elapsed Time"}
                    >
                        {format(displaySeconds)}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-[#A0A0B0] tracking-wider mt-1">
                        {status === 'paused' ? 'Paused' : (mode === 'remaining' && targetSeconds ? 'Remaining' : 'Elapsed')}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
                {status === 'running' && (
                    <>
                        <Button variant="ghost" onClick={pause}><Pause size={14} /> Pause</Button>
                        <Button variant="ghost" onClick={addLap}><Flag size={14} /> Lap</Button>
                        <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                    </>
                )}
                {status === 'paused' && (
                    <>
                        <Button onClick={resume}><Play size={14} /> Resume</Button>
                        <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                    </>
                )}
                {/* Fallback for when active session exists but timer is idle (e.g. bug recovery) */}
                {status === 'idle' && (
                    <Button onClick={() => timer.start({ subject: activeSession.subject, linkedResourceId: activeSession.linkedResourceId })}><Play size={14} /> Resume Session</Button>
                )}
                <Button variant="ghost" onClick={handleReset} className="text-red-400 hover:text-red-600 ml-auto">
                    Discard
                </Button>
            </div>

            <LapList laps={laps} format={format} />

            {activeSession?.notes && (
                <p className="text-xs text-[#7A7A8A] mt-3 pt-3 border-t border-[#F0EEE9]">{activeSession.notes}</p>
            )}
        </Card>
    );
}

// ── Quick-start panel — receives timer props from parent ──────────────────────
function QuickStartPanel({ timer, activeSession, resources, onStart, onStop }) {
    const { elapsed, status, laps, pause, resume, stop, addLap, format } = timer;
    const [quickSubject, setQuickSubject] = useState('');
    const [quickResource, setQuickResource] = useState('');

    const handleStart = () => {
        startAdHocSession({
            subject: quickSubject.trim() || 'Study Session',
            linkedResourceId: quickResource || null,
            notes: '',
            date: today(),
        });
        timer.start();
        onStart();
    };

    const handleStop = () => {
        const completed = stop();
        onStop(completed);
        setQuickSubject('');
        setQuickResource('');
    };

    return (
        <Card className="p-6">
            <CardHeader title="Quick Start" />
            <p className="text-xs text-[#7A7A8A] mb-4">
                Start a timer immediately — session saves to completed when you stop.
            </p>
            <input
                className="w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg mb-3 focus:outline-none focus:border-[#2C4A7C]"
                placeholder="Subject / Topic"
                value={quickSubject}
                onChange={e => setQuickSubject(e.target.value)}
                disabled={status !== 'idle'}
            />
            {resources.length > 0 && (
                <select
                    className="w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg mb-4 focus:outline-none focus:border-[#2C4A7C] bg-white"
                    value={quickResource}
                    onChange={e => setQuickResource(e.target.value)}
                    disabled={status !== 'idle'}
                >
                    <option value="">No resource linked</option>
                    {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                </select>
            )}
            <div className={`text-5xl font-bold tracking-tight mb-5 tabular-nums text-center ${status === 'running' ? 'text-[#2C4A7C]' : 'text-[#1A1A2E]'}`}>
                {format(elapsed)}
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
                {status === 'idle' && (
                    <Button onClick={handleStart}><Play size={14} /> Start</Button>
                )}
                {status === 'running' && (
                    <>
                        <Button variant="ghost" onClick={pause}><Pause size={14} /> Pause</Button>
                        <Button variant="ghost" onClick={addLap}><Flag size={14} /> Lap</Button>
                        <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                    </>
                )}
                {status === 'paused' && (
                    <>
                        <Button onClick={resume}><Play size={14} /> Resume</Button>
                        <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                    </>
                )}
            </div>
            <LapList laps={laps} format={format} />
        </Card>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudyTracker() {
    const [scheduled, setScheduled] = useState(getScheduledSessions);
    const [completed, setCompleted] = useState(getCompletedSessions);
    const [activeSession, setActiveSession] = useState(getActiveSession);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(BLANK_SCHEDULE);
    const [tab, setTab] = useState('scheduled');
    const resources = getResources();

    const reload = useCallback(() => {
        setScheduled(getScheduledSessions());
        setCompleted(getCompletedSessions());
        setActiveSession(getActiveSession());
    }, []);

    // Single timer hook instance — shared between ActivePanel and QuickStartPanel
    const timer = useStudyTimer({ onComplete: () => reload() });

    // ── Schedule a session ────────────────────────────────────────────────────
    const handleSchedule = () => {
        if (!form.subject.trim()) return;
        addScheduledSession({ ...form });
        setModal(false);
        setForm(BLANK_SCHEDULE);
        reload();
    };

    // ── Start a scheduled session ─────────────────────────────────────────────
    const handleStartScheduled = (id) => {
        if (activeSession) {
            alert('You already have an active session. Stop it first.');
            return;
        }
        const session = startScheduledSession(id);
        if (session && session.duration) {
            timer.start({ targetSeconds: session.duration * 60 });
        } else {
            timer.start();
        }
        reload();
    };

    // ── Delete handlers ───────────────────────────────────────────────────────
    const handleDeleteScheduled = (id) => {
        if (confirm('Remove this scheduled session?')) { deleteScheduledSession(id); reload(); }
    };
    const handleDeleteCompleted = (id) => {
        if (confirm('Delete this completed session?')) { deleteCompletedSession(id); reload(); }
    };

    const totalMins = completed.reduce((s, x) => s + Number(x.duration || 0), 0);
    const todayMins = completed.filter(s => s.date === today()).reduce((s, x) => s + Number(x.duration || 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Study Tracker</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">
                        Total: {formatDuration(totalMins)} · Today: {formatDuration(todayMins)}
                    </p>
                </div>
                <Button onClick={() => { setForm(BLANK_SCHEDULE); setModal(true); }}>
                    <Calendar size={15} /> Schedule Session
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Active Session or Quick-Start — timer prop passed down, never duplicated */}
                {activeSession ? (
                    <ActivePanel
                        activeSession={activeSession}
                        timer={timer}
                        onStop={() => reload()}
                        onReset={() => reload()}
                    />
                ) : (
                    <QuickStartPanel
                        timer={timer}
                        activeSession={activeSession}
                        resources={resources}
                        onStart={() => reload()}
                        onStop={() => reload()}
                    />
                )}

                {/* Subject breakdown from completed sessions only */}
                <Card className="p-5">
                    <CardHeader title="By Subject (Completed)" />
                    {completed.length === 0 ? (
                        <EmptyState message="No completed sessions yet." />
                    ) : (() => {
                        const map = {};
                        completed.forEach(s => { map[s.subject] = (map[s.subject] || 0) + Number(s.duration || 0); });
                        const subjects = Object.entries(map).sort((a, b) => b[1] - a[1]);
                        return subjects.map(([subject, mins]) => (
                            <div key={subject} className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-[#1A1A2E]">{subject}</span>
                                    <span className="text-sm font-semibold text-[#2C4A7C]">{formatDuration(mins)}</span>
                                </div>
                                <ProgressBar value={(mins / totalMins) * 100} />
                            </div>
                        ));
                    })()}
                </Card>
            </div>

            {/* Session History Tabs */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1">
                        {[
                            { key: 'scheduled', label: `Scheduled (${scheduled.length})`, icon: Calendar },
                            { key: 'completed', label: `Completed (${completed.length})`, icon: CheckCircle2 },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${tab === key ? 'bg-[#2C4A7C] text-white' : 'text-[#4A4A5A] hover:bg-[#F5F4F0]'
                                    }`}
                            >
                                <Icon size={12} /> {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scheduled tab */}
                {tab === 'scheduled' && (
                    scheduled.length === 0 ? (
                        <EmptyState message="No scheduled sessions. Click 'Schedule Session' to plan ahead." />
                    ) : (
                        <div className="space-y-0">
                            {scheduled.map(s => {
                                const resource = s.linkedResourceId
                                    ? resources.find(r => r.id === s.linkedResourceId)
                                    : null;
                                return (
                                    <div key={s.id} className="flex items-center gap-3 py-3 border-b border-[#F0EEE9] last:border-0">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Timer size={16} color="#6B7280" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-[#1A1A2E]">{s.subject}</div>
                                            <div className="text-xs text-[#7A7A8A]">
                                                {formatDate(s.date)}
                                                {resource ? ` · ${resource.title}` : ''}
                                                {s.notes ? ` · ${s.notes}` : ''}
                                            </div>
                                        </div>
                                        <StatusBadge status="scheduled" />
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleStartScheduled(s.id)}
                                            className="text-[#2C4A7C] hover:bg-[#EBF0F8]"
                                        >
                                            <Play size={13} /> Start
                                        </Button>
                                        <Button variant="icon" onClick={() => handleDeleteScheduled(s.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Completed tab */}
                {tab === 'completed' && (
                    completed.length === 0 ? (
                        <EmptyState message="No completed sessions yet. Start a timer to begin studying!" />
                    ) : (
                        <div className="space-y-0">
                            {[...completed].reverse().map(s => {
                                const resource = s.linkedResourceId
                                    ? resources.find(r => r.id === s.linkedResourceId)
                                    : null;
                                return (
                                    <div key={s.id} className="flex items-center gap-3 py-3 border-b border-[#F0EEE9] last:border-0">
                                        <div className="w-9 h-9 rounded-lg bg-[#EBF5EE] flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={16} color="#4A7C59" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-[#1A1A2E]">{s.subject}</div>
                                            <div className="text-xs text-[#7A7A8A]">
                                                {formatDate(s.date || s.completedAt?.slice(0, 10))}
                                                {resource ? ` · ${resource.title}` : ''}
                                                {s.notes ? ` · ${s.notes}` : ''}
                                                {s.laps?.length > 0 ? ` · ${s.laps.length} lap${s.laps.length > 1 ? 's' : ''}` : ''}
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-[#2C4A7C]">{formatDuration(Number(s.duration))}</span>
                                        <StatusBadge status="completed" />
                                        <Button variant="icon" onClick={() => handleDeleteCompleted(s.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </Card>

            {/* Schedule Session Modal */}
            {modal && (
                <Modal
                    title="Schedule Study Session"
                    onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSchedule}>Schedule</Button>
                        </>
                    }
                >
                    <p className="text-xs text-[#7A7A8A] mb-4 p-3 bg-[#F5F4F0] rounded-lg">
                        📅 Scheduling a session does <strong>not</strong> affect analytics. Only completed sessions count.
                    </p>
                    <Input
                        label="Subject / Topic"
                        placeholder="e.g. Mathematics, DSA"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        autoFocus
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    />
                    {resources.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-[#4A4A5A] mb-1">Link Resource (optional)</label>
                            <select
                                className="w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg focus:outline-none focus:border-[#2C4A7C] bg-white"
                                value={form.linkedResourceId}
                                onChange={e => setForm(f => ({ ...f, linkedResourceId: e.target.value }))}
                            >
                                <option value="">No resource</option>
                                {resources.map(r => (
                                    <option key={r.id} value={r.id}>{r.title} ({r.type})</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Textarea
                        label="Notes (optional)"
                        placeholder="What do you plan to study?"
                        value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                </Modal>
            )}
        </div>
    );
}
