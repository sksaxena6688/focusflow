// Notes.jsx — notes CRUD with search and tags
import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import Card, { CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { getNotes, addNote, updateNote, deleteNote } from '../utils/storage';
import { formatDateTime } from '../utils/dateHelpers';

const BLANK = { title: '', content: '', tags: '' };

export default function Notes() {
    const [notes, setNotes] = useState(getNotes);
    const [modal, setModal] = useState(false);
    const [editing, setEdit] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [search, setSearch] = useState('');
    const [activeTag, setTag] = useState('All');

    const reload = () => setNotes(getNotes());

    const openAdd = () => { setForm(BLANK); setEdit(null); setModal(true); };
    const openEdit = (n) => { setForm({ title: n.title, content: n.content, tags: (n.tags || []).join(', ') }); setEdit(n); setModal(true); };

    const handleSave = () => {
        if (!form.title.trim()) return;
        const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        editing
            ? updateNote(editing.id, { title: form.title, content: form.content, tags })
            : addNote({ title: form.title, content: form.content, tags });
        setModal(false); reload();
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm('Delete note?')) { deleteNote(id); reload(); }
    };

    const allTags = ['All', ...new Set(notes.flatMap(n => n.tags || []))];
    const filtered = notes.filter(n => {
        const q = search.toLowerCase();
        const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        const matchTag = activeTag === 'All' || (n.tags || []).includes(activeTag);
        return matchSearch && matchTag;
    });

    return (
        <div>
            <div className="flex items-start justify-between mb-7">
                <div>
                    <h2 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">Notes</h2>
                    <p className="text-sm text-[#7A7A8A] mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
                </div>
                <Button onClick={openAdd}><Plus size={15} /> New Note</Button>
            </div>

            {/* Search + Tags */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
                <div className="relative max-w-xs flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A8A]" />
                    <input
                        className="w-full pl-9 pr-3 py-2 text-sm border border-[#E0DDD6] rounded-lg bg-white focus:outline-none focus:border-[#2C4A7C]"
                        placeholder="Search notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {allTags.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                        {allTags.map(tag => (
                            <button key={tag} onClick={() => setTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${activeTag === tag ? 'bg-[#2C4A7C] text-white border-[#2C4A7C]' : 'bg-white text-[#4A4A5A] border-[#E0DDD6] hover:bg-[#F5F4F0]'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes Grid */}
            {filtered.length === 0 ? (
                <Card className="p-5"><EmptyState message={search ? 'No notes match your search.' : 'No notes yet. Create your first one!'} /></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(n => (
                        <div key={n.id} onClick={() => openEdit(n)}
                            className="bg-white border border-[#E0DDD6] rounded-xl p-5 shadow-sm cursor-pointer hover:border-[#2C4A7C] hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-semibold text-[#1A1A2E] leading-snug">{n.title}</h4>
                                <button onClick={e => handleDelete(n.id, e)} className="text-[#7A7A8A] hover:text-red-500 transition-colors ml-2 shrink-0">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <p className="text-xs text-[#7A7A8A] line-clamp-3 mb-3">{n.content || <em>No content</em>}</p>
                            {(n.tags || []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {n.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-[#EBF0F8] text-[#2C4A7C] rounded-full text-[0.65rem] font-medium">{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div className="text-[0.65rem] text-[#7A7A8A]">{formatDateTime(n.updatedAt)}</div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <Modal title={editing ? 'Edit Note' : 'New Note'} onClose={() => setModal(false)}
                    footer={
                        <>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={handleSave}>{editing ? 'Save' : 'Add Note'}</Button>
                        </>
                    }
                >
                    <Input label="Title" placeholder="Note title" value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                    <Textarea label="Content" placeholder="Write your notes here..." value={form.content}
                        onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="min-h-[160px]" />
                    <Input label="Tags (comma-separated)" placeholder="e.g. Math, DSA, Revision" value={form.tags}
                        onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </Modal>
            )}
        </div>
    );
}
