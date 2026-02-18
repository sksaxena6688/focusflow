// Habits.jsx — habit tracker page
import { useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, Flame } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import Card, { CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
    getHabits, addHabit, updateHabit, deleteHabit,
    getHabitLogs, toggleHabitLog, isHabitDone
} from '../utils/storage';
import { today, lastNDays, dayLabel, calcStreak } from '../utils/dateHelpers';

const FREQ = ['Daily', 'Weekdays', 'Weekends', 'Custom'];
const BLANK = { name: '', frequency: 'Daily', target: 1 };

export default function Habits() {
    const [habits, setHabits] = useState(getHabits);
    const [logs, setLogs] = useState(getHabitLogs);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(BLANK);
    const week = lastNDays(7);
    const todayStr = today();

    const reload = () => { setHabits(getHabits()); setLogs(getHabitLogs()); };

    const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
    const openEdit = (h) => { setForm({ name: h.name, frequency: h.frequency, target: h.target || 1 }); setEditing(h); setModal(true); };

    const handleSave = () => {
        if (!form.name.trim()) return;
        editing ? updateHabit(editing.id, form) : addHabit(form);
        setModal(false); reload();
    };

    const handleDelete = (id) => { if (confirm('Delete this habit?')) { deleteHabit(id); reload(); } };

    const handleToggle = (habitId, date) => { toggleHabitLog(habitId, date); reload(); };

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Habits</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">Build consistency, one day at a time.</p>
                </div>
                <Button onClick={openAdd}><Plus size={15} /> New Habit</Button>
            </div>

            {/* Today's Check-in */}
            <Card className="p-5 mb-5">
                <CardHeader title="Today's Check-in" />
                {habits.length === 0 ? (
                    <EmptyState message="No habits yet. Create your first one!" />
                ) : (
                    habits.map(h => {
                        const done = isHabitDone(h.id, todayStr);
                        const streak = calcStreak(logs.filter(l => l.habitId === h.id).map(l => l.date));
                        return (
                            <div key={h.id} className="flex items-center gap-3 py-2.5 border-b border-[#F0EEE9] last:border-0">
                                <button
                                    onClick={() => handleToggle(h.id, todayStr)}
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${done ? 'bg-[#4A7C59] border-[#4A7C59]' : 'border-[#E0DDD6] hover:border-[#4A7C59]'}`}
                                >
                                    {done && <span className="text-white text-xs">✓</span>}
                                </button>
                                <span className={`flex-1 text-sm font-medium ${done ? 'line-through text-[#7A7A8A]' : 'text-[#1A1A2E]'}`}>{h.name}</span>
                                <span className="text-xs text-[#7A7A8A]">{h.frequency}</span>
                                {streak > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                                        <Flame size={10} /> {streak}d
                                    </span>
                                )}
                                <Button variant="icon" onClick={() => openEdit(h)}><Edit2 size={13} /></Button>
                                <Button variant="icon" onClick={() => handleDelete(h.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></Button>
                            </div>
                        );
                    })
                )}
            </Card>

            {/* 7-Day Grid */}
            {habits.length > 0 && (
                <Card className="p-5">
                    <CardHeader title="7-Day Overview" />
                    {/* Header row */}
                    <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}>
                        <div />
                        {week.map(d => (
                            <div key={d} className={`text-center text-[0.65rem] font-medium ${d === todayStr ? 'text-[#2C4A7C] font-bold' : 'text-[#7A7A8A]'}`}>
                                {dayLabel(d)}<br /><span className="text-[0.6rem]">{d.slice(8)}</span>
                            </div>
                        ))}
                    </div>
                    {habits.map(h => (
                        <div key={h.id} className="grid gap-1 mb-1.5 items-center" style={{ gridTemplateColumns: '160px repeat(7, 1fr)' }}>
                            <div className="text-xs font-medium text-[#1A1A2E] truncate pr-2">{h.name}</div>
                            {week.map(d => {
                                const done = logs.some(l => l.habitId === h.id && l.date === d);
                                return (
                                    <button
                                        key={d}
                                        onClick={() => handleToggle(h.id, d)}
                                        title={d}
                                        className={`h-7 rounded-md border transition-colors cursor-pointer flex items-center justify-center ${done ? 'bg-[#4A7C59] border-[#4A7C59]' : d === todayStr ? 'border-[#2C4A7C] bg-[#F5F4F0]' : 'border-[#E0DDD6] bg-[#F5F4F0] hover:border-[#4A7C59]'
                                            }`}
                                    >
                                        {done && <span className="text-white text-[10px]">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </Card>
            )}

            {modal && (
                <Modal
                    title={editing ? 'Edit Habit' : 'New Habit'}
                    onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? 'Save Changes' : 'Add Habit'}</Button>
                        </>
                    }
                >
                    <Input label="Habit Name" placeholder="e.g. DSA Practice" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Frequency" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                            {FREQ.map(o => <option key={o}>{o}</option>)}
                        </Select>
                        <Input label="Daily Target" type="number" min={1} max={10} value={form.target}
                            onChange={e => setForm(f => ({ ...f, target: Number(e.target.value) }))} />
                    </div>
                </Modal>
            )}
        </div>
    );
}
