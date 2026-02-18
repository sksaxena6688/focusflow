// Tasks.jsx — task tracker page
import { useState } from 'react';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Input, Textarea, Select } from '../components/ui/Input';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { getTasks, addTask, updateTask, deleteTask } from '../utils/storage';
import { formatDate, isOverdue, today } from '../utils/dateHelpers';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['All', 'Pending', 'Completed'];
const SORTS = ['Due Date', 'Priority', 'Created'];
const PRIO_ORDER = { High: 0, Medium: 1, Low: 2 };
const PRIO_BADGE = { Low: 'low', Medium: 'medium', High: 'high' };
const BLANK = { title: '', description: '', dueDate: '', priority: 'Medium' };

export default function Tasks() {
    const [tasks, setTasks] = useState(getTasks);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [filterStatus, setFS] = useState('All');
    const [filterPriority, setFP] = useState('All');
    const [sortBy, setSort] = useState('Due Date');

    const reload = () => setTasks(getTasks());

    const openAdd = () => { setForm(BLANK); setEditing(null); setModal(true); };
    const openEdit = (t) => { setForm({ title: t.title, description: t.description || '', dueDate: t.dueDate || '', priority: t.priority }); setEditing(t); setModal(true); };

    const handleSave = () => {
        if (!form.title.trim()) return;
        editing
            ? updateTask(editing.id, { ...form, updatedAt: new Date().toISOString() })
            : addTask(form);
        setModal(false); reload();
    };

    const handleDelete = (id) => { if (confirm('Delete task?')) { deleteTask(id); reload(); } };

    const handleToggle = (t) => {
        updateTask(t.id, { completed: !t.completed, updatedAt: new Date().toISOString() });
        reload();
    };

    const filtered = tasks
        .filter(t => {
            if (filterStatus === 'Pending' && t.completed) return false;
            if (filterStatus === 'Completed' && !t.completed) return false;
            if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'Due Date') return (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1;
            if (sortBy === 'Priority') return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority];
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Tasks</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">{pending} pending · {completed} completed</p>
                </div>
                <Button onClick={openAdd}><Plus size={15} /> New Task</Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
                <div className="flex gap-1.5">
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => setFS(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${filterStatus === s ? 'bg-[#2C4A7C] text-white border-[#2C4A7C]' : 'bg-white text-[#4A4A5A] border-[#E0DDD6] hover:bg-[#F5F4F0]'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1.5">
                    {['All', ...PRIORITIES].map(p => (
                        <button key={p} onClick={() => setFP(p)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${filterPriority === p ? 'bg-[#2C4A7C] text-white border-[#2C4A7C]' : 'bg-white text-[#4A4A5A] border-[#E0DDD6] hover:bg-[#F5F4F0]'}`}>
                            {p}
                        </button>
                    ))}
                </div>
                <select value={sortBy} onChange={e => setSort(e.target.value)}
                    className="ml-auto px-3 py-1.5 text-xs border border-[#E0DDD6] rounded-lg bg-white text-[#4A4A5A] focus:outline-none">
                    {SORTS.map(o => <option key={o}>{o}</option>)}
                </select>
            </div>

            {/* Task List */}
            {filtered.length === 0 ? (
                <Card className="p-5"><EmptyState message="No tasks match your filters." /></Card>
            ) : (
                filtered.map(t => (
                    <div key={t.id} className={`flex items-start gap-3 p-4 bg-white border border-[#E0DDD6] rounded-xl mb-2 hover:border-[#2C4A7C] transition-colors ${t.completed ? 'opacity-60' : ''}`}>
                        <button
                            onClick={() => handleToggle(t)}
                            className={`w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors cursor-pointer ${t.completed ? 'bg-[#4A7C59] border-[#4A7C59]' : 'border-[#E0DDD6] hover:border-[#4A7C59]'}`}
                        >
                            {t.completed && <span className="text-white text-[10px]">✓</span>}
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${t.completed ? 'line-through text-[#7A7A8A]' : 'text-[#1A1A2E]'}`}>{t.title}</div>
                            {t.description && <div className="text-xs text-[#7A7A8A] mt-0.5">{t.description}</div>}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant={PRIO_BADGE[t.priority]}>{t.priority}</Badge>
                                {t.dueDate && (
                                    <span className={`flex items-center gap-1 text-xs ${isOverdue(t.dueDate) && !t.completed ? 'text-red-600' : 'text-[#7A7A8A]'}`}>
                                        <Calendar size={10} /> {formatDate(t.dueDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button variant="icon" onClick={() => openEdit(t)}><Edit2 size={13} /></Button>
                        <Button variant="icon" onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></Button>
                    </div>
                ))
            )}

            {modal && (
                <Modal title={editing ? 'Edit Task' : 'New Task'} onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? 'Save' : 'Add Task'}</Button>
                        </>
                    }
                >
                    <Input label="Title" placeholder="Task title" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                    <Textarea label="Description (optional)" placeholder="Details..." value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Due Date" type="date" value={form.dueDate} min={today()}
                            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                        <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                        </Select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
