// StudyTracker.jsx — study session logging + timer
import { useState } from 'react';
import { Plus, Trash2, Play, Pause, Square, Clock } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import Card, { CardHeader } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { useTimer } from '../hooks/useTimer';
import { getSessions, addSession, deleteSession } from '../utils/storage';
import { today, formatDate, formatDuration } from '../utils/dateHelpers';

const BLANK = { subject: '', duration: '', date: today(), notes: '' };

export default function StudyTracker() {
    const [sessions, setSessions] = useState(getSessions);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [timerSubject, setTS] = useState('');
    const timer = useTimer();

    const reload = () => setSessions(getSessions());

    const handleSave = () => {
        if (!form.subject.trim() || !form.duration) return;
        addSession({ ...form, duration: Number(form.duration) });
        setModal(false); setForm(BLANK); reload();
    };

    const handleStop = () => {
        if (timer.seconds < 5) { timer.reset(); return; }
        const mins = Math.max(1, Math.round(timer.seconds / 60));
        addSession({ subject: timerSubject || 'Study Session', duration: mins, date: today(), notes: 'Timer session' });
        timer.reset(); setTS(''); reload();
    };

    const handleDelete = (id) => { if (confirm('Delete session?')) { deleteSession(id); reload(); } };

    const totalMins = sessions.reduce((s, x) => s + Number(x.duration || 0), 0);
    const todayMins = sessions.filter(s => s.date === today()).reduce((s, x) => s + Number(x.duration || 0), 0);

    const subjectMap = {};
    sessions.forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + Number(s.duration || 0); });
    const subjects = Object.entries(subjectMap).sort((a, b) => b[1] - a[1]);

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Study Tracker</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">Total: {formatDuration(totalMins)} · Today: {formatDuration(todayMins)}</p>
                </div>
                <Button onClick={() => { setForm(BLANK); setModal(true); }}><Plus size={15} /> Log Session</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Timer */}
                <Card className="p-6 text-center">
                    <CardHeader title="Timer Mode" />
                    <input
                        className="w-full px-3 py-2 text-sm border border-[#E0DDD6] rounded-lg text-center mb-4 focus:outline-none focus:border-[#2C4A7C]"
                        placeholder="Subject / Topic"
                        value={timerSubject}
                        onChange={e => setTS(e.target.value)}
                        disabled={timer.status !== 'idle'}
                    />
                    <div className={`text-5xl font-bold tracking-tight mb-5 tabular-nums ${timer.status === 'running' ? 'text-[#2C4A7C]' : 'text-[#1A1A2E]'}`}>
                        {timer.format(timer.seconds)}
                    </div>
                    <div className="flex gap-2 justify-center">
                        {timer.status === 'idle' && (
                            <Button onClick={timer.start}><Play size={14} /> Start</Button>
                        )}
                        {timer.status === 'running' && (
                            <>
                                <Button variant="ghost" onClick={timer.pause}><Pause size={14} /> Pause</Button>
                                <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                            </>
                        )}
                        {timer.status === 'paused' && (
                            <>
                                <Button onClick={timer.resume}><Play size={14} /> Resume</Button>
                                <Button variant="accent" onClick={handleStop}><Square size={14} /> Stop & Save</Button>
                            </>
                        )}
                    </div>
                </Card>

                {/* By Subject */}
                <Card className="p-5">
                    <CardHeader title="By Subject" />
                    {subjects.length === 0 ? (
                        <EmptyState message="No sessions yet." />
                    ) : (
                        subjects.map(([subject, mins]) => (
                            <div key={subject} className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-[#1A1A2E]">{subject}</span>
                                    <span className="text-sm font-semibold text-[#2C4A7C]">{formatDuration(mins)}</span>
                                </div>
                                <ProgressBar value={(mins / totalMins) * 100} />
                            </div>
                        ))
                    )}
                </Card>
            </div>

            {/* Session History */}
            <Card className="p-5">
                <CardHeader title="Session History" />
                {sessions.length === 0 ? (
                    <EmptyState message="No sessions logged yet." />
                ) : (
                    [...sessions].reverse().map(s => (
                        <div key={s.id} className="flex items-center gap-3 py-3 border-b border-[#F0EEE9] last:border-0">
                            <div className="w-9 h-9 rounded-lg bg-[#EBF0F8] flex items-center justify-center shrink-0">
                                <Clock size={16} color="#2C4A7C" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#1A1A2E]">{s.subject}</div>
                                <div className="text-xs text-[#7A7A8A]">{formatDate(s.date)}{s.notes ? ` · ${s.notes}` : ''}</div>
                            </div>
                            <span className="text-sm font-semibold text-[#2C4A7C]">{formatDuration(Number(s.duration))}</span>
                            <Button variant="icon" onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></Button>
                        </div>
                    ))
                )}
            </Card>

            {modal && (
                <Modal title="Log Study Session" onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Session</Button>
                        </>
                    }
                >
                    <Input label="Subject / Topic" placeholder="e.g. Mathematics, DSA" value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} autoFocus />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Duration (minutes)" type="number" min={1} placeholder="60" value={form.duration}
                            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                        <Input label="Date" type="date" value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <Textarea label="Notes (optional)" placeholder="What did you study?" value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </Modal>
            )}
        </div>
    );
}
