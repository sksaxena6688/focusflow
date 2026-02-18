// Resources.jsx — study material tracker
import { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, BookOpen, BookMarked, Tag } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import { getResources, addResource, updateResource, deleteResource } from '../utils/storage';

const TYPES = ['All', 'PDF', 'Course', 'Book', 'Topic'];
const TYPE_META = {
    PDF: { icon: FileText, color: '#C0392B', bg: '#FDECEA' },
    Course: { icon: BookOpen, color: '#2C4A7C', bg: '#EBF0F8' },
    Book: { icon: BookMarked, color: '#4A7C59', bg: '#EBF5EE' },
    Topic: { icon: Tag, color: '#B7791F', bg: '#FEF3C7' },
};
const BLANK = { title: '', type: 'PDF', estimatedHours: '', actualHours: '', progress: 0, notes: '' };

export default function Resources() {
    const [resources, setResources] = useState(getResources);
    const [modal, setModal] = useState(false);
    const [editing, setEdit] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [filterType, setFT] = useState('All');

    const reload = () => setResources(getResources());

    const openAdd = () => { setForm(BLANK); setEdit(null); setModal(true); };
    const openEdit = (r) => {
        setForm({ title: r.title, type: r.type, estimatedHours: r.estimatedHours || '', actualHours: r.actualHours || '', progress: r.progress || 0, notes: r.notes || '' });
        setEdit(r); setModal(true);
    };

    const handleSave = () => {
        if (!form.title.trim()) return;
        const data = { ...form, estimatedHours: Number(form.estimatedHours) || 0, actualHours: Number(form.actualHours) || 0, progress: Number(form.progress) || 0 };
        editing ? updateResource(editing.id, data) : addResource(data);
        setModal(false); reload();
    };

    const handleDelete = (id) => { if (confirm('Delete resource?')) { deleteResource(id); reload(); } };

    const filtered = filterType === 'All' ? resources : resources.filter(r => r.type === filterType);

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Resources</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">Track your PDFs, courses, books, and topics.</p>
                </div>
                <Button onClick={openAdd}><Plus size={15} /> Add Resource</Button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-1.5 mb-5 flex-wrap">
                {TYPES.map(t => (
                    <button key={t} onClick={() => setFT(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${filterType === t ? 'bg-[#2C4A7C] text-white border-[#2C4A7C]' : 'bg-white text-[#4A4A5A] border-[#E0DDD6] hover:bg-[#F5F4F0]'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white border border-[#E0DDD6] rounded-xl p-5">
                    <EmptyState message="No resources yet. Add your first study material!" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(r => {
                        const meta = TYPE_META[r.type] || TYPE_META.Topic;
                        const Icon = meta.icon;
                        const pct = Math.min(100, Number(r.progress) || 0);
                        return (
                            <div key={r.id} className="bg-white border border-[#E0DDD6] rounded-xl p-5 shadow-sm hover:border-[#2C4A7C] transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.bg }}>
                                        <Icon size={15} color={meta.color} />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="icon" onClick={() => openEdit(r)}><Edit2 size={13} /></Button>
                                        <Button variant="icon" onClick={() => handleDelete(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></Button>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase mb-2" style={{ background: meta.bg, color: meta.color }}>
                                    {r.type}
                                </span>
                                <h4 className="text-sm font-semibold text-[#1A1A2E] mb-1">{r.title}</h4>
                                {r.notes && <p className="text-xs text-[#7A7A8A] mb-3">{r.notes}</p>}
                                <div className="mb-1 flex justify-between">
                                    <span className="text-xs text-[#7A7A8A]">Progress</span>
                                    <span className={`text-xs font-semibold ${pct === 100 ? 'text-[#4A7C59]' : 'text-[#1A1A2E]'}`}>{pct}%</span>
                                </div>
                                <ProgressBar value={pct} color={pct === 100 ? '#4A7C59' : '#2C4A7C'} className="mb-3" />
                                <div className="flex gap-4">
                                    {Number(r.estimatedHours) > 0 && (
                                        <div><div className="text-[0.65rem] text-[#7A7A8A]">Estimated</div><div className="text-sm font-semibold">{r.estimatedHours}h</div></div>
                                    )}
                                    {Number(r.actualHours) > 0 && (
                                        <div><div className="text-[0.65rem] text-[#7A7A8A]">Spent</div><div className="text-sm font-semibold text-[#2C4A7C]">{r.actualHours}h</div></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {modal && (
                <Modal title={editing ? 'Edit Resource' : 'Add Resource'} onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
                        </>
                    }
                >
                    <Input label="Title" placeholder="e.g. OS Unit 2 PDF" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                            {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                        </Select>
                        <Input label="Progress (%)" type="number" min={0} max={100} value={form.progress}
                            onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Estimated Hours" type="number" min={0} step={0.5} placeholder="5" value={form.estimatedHours}
                            onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} />
                        <Input label="Actual Hours Spent" type="number" min={0} step={0.5} placeholder="2" value={form.actualHours}
                            onChange={e => setForm(f => ({ ...f, actualHours: e.target.value }))} />
                    </div>
                    <Textarea label="Notes (optional)" placeholder="Any notes about this resource..." value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </Modal>
            )}
        </div>
    );
}
