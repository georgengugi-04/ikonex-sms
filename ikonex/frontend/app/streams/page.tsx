'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { streams as streamsApi, subjects as subjectsApi } from '@/lib/api';
import { ClassStream, Subject } from '@/types';
import { Plus, Pencil, Trash2, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StreamsPage() {
  const [data, setData] = useState<ClassStream[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ClassStream | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([streamsApi.list(), subjectsApi.list()]).then(([sr, subr]) => {
      setData(sr.data.data); setSubjectList(subr.data.data);
    });
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', description: '' }); setSelectedSubjects([]); setModal(true); };
  const openEdit = (s: ClassStream) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '' });
    setSelectedSubjects(s.subjects?.map(cs => cs.subjectId) || []);
    setModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = editing ? await streamsApi.update(editing.id, form) : await streamsApi.create(form);
      const id = editing ? editing.id : res.data.data.id;
      await streamsApi.assignSubjects(id, selectedSubjects);
      toast.success(editing ? 'Stream updated' : 'Stream created');
      setModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await streamsApi.delete(id); toast.success('Stream deleted'); load(); }
    catch { toast.error('Could not delete — remove students first'); }
  };

  const toggleSubject = (id: string) => setSelectedSubjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <DashboardLayout title="Class Streams">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Stream
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{s.name}</h3>
                  {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Pencil size={15} /></button>
                  <button onClick={() => remove(s.id, s.name)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600"><Users size={14} /><span>{s._count?.students ?? 0} students</span></div>
                <div className="flex items-center gap-1.5 text-gray-600"><BookOpen size={14} /><span>{s.subjects?.length ?? 0} subjects</span></div>
              </div>
              {s.subjects && s.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.subjects.map(cs => <span key={cs.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{cs.subject.code}</span>)}
                </div>
              )}
            </div>
          ))}
          {data.length === 0 && <div className="col-span-3 text-center text-gray-400 py-12">No streams yet. Create one to get started.</div>}
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Stream' : 'Create Stream'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stream Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Form 1A"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Assign Subjects</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {subjectList.map(sub => (
                <label key={sub.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm border transition-colors ${selectedSubjects.includes(sub.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={selectedSubjects.includes(sub.id)} onChange={() => toggleSubject(sub.id)} className="hidden" />
                  <span>{sub.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
