'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import { subjects as subjectsApi } from '@/lib/api';
import { Subject } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [data, setData] = useState<Subject[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = () => subjectsApi.list().then(r => setData(r.data.data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', code: '', description: '' }); setModal(true); };
  const openEdit = (s: Subject) => { setEditing(s); setForm({ name: s.name, code: s.code, description: s.description || '' }); setModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) await subjectsApi.update(editing.id, form);
      else await subjectsApi.create(form);
      toast.success(editing ? 'Subject updated' : 'Subject created');
      setModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await subjectsApi.delete(id); toast.success('Subject deleted'); load(); }
    catch { toast.error('Could not delete'); }
  };

  return (
    <DashboardLayout title="Subjects">
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Subject
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>{['Subject Name', 'Code', 'Description', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">{s.code}</span></td>
                  <td className="px-4 py-3 text-gray-500">{s.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Pencil size={15} /></button>
                      <button onClick={() => remove(s.id, s.name)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No subjects yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Subject' : 'Add Subject'}>
        <div className="space-y-4">
          {[['Subject Name', 'name', 'text'], ['Subject Code', 'code', 'text'], ['Description', 'description', 'text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
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
