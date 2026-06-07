'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { students as studentsApi, streams as streamsApi } from '@/lib/api';
import { Student, ClassStream } from '@/types';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { firstName: '', lastName: '', gender: 'MALE', dateOfBirth: '', parentName: '', parentPhone: '', email: '', address: '', classStreamId: '' };

export default function StudentsPage() {
  const [data, setData] = useState<{ students: Student[]; total: number }>({ students: [], total: 0 });
  const [streamList, setStreamList] = useState<ClassStream[]>([]);
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, stRes] = await Promise.all([
        studentsApi.list({ search, streamId: streamFilter }),
        streamsApi.list()
      ]);
      setData(sRes.data.data);
      setStreamList(stRes.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, streamFilter]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s: Student) => { setEditing(s); setForm({ ...s, dateOfBirth: s.dateOfBirth?.split('T')[0] }); setModal(true); };

  const save = async () => {
    if (!form.classStreamId) return toast.error('Select a class stream');
    setSaving(true);
    try {
      if (editing) await studentsApi.update(editing.id, form);
      else await studentsApi.create(form);
      toast.success(editing ? 'Student updated' : 'Student registered');
      setModal(false); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await studentsApi.delete(id); toast.success('Student deleted'); load(); }
    catch { toast.error('Could not delete'); }
  };

  return (
    <DashboardLayout title="Students">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={streamFilter} onChange={e => setStreamFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Streams</option>
              {streamList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Student
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">{data.total} student{data.total !== 1 ? 's' : ''} found</span>
          </div>
          {loading ? <div className="p-8 text-center text-gray-400">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>{['Adm No', 'Name', 'Gender', 'Stream', 'Parent', 'Phone', 'Actions'].map(h =>
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{s.admissionNo}</td>
                      <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                      <td className="px-4 py-3"><Badge text={s.gender} /></td>
                      <td className="px-4 py-3 text-gray-600">{s.classStream?.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.parentName}</td>
                      <td className="px-4 py-3 text-gray-600">{s.parentPhone}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <a href={`/students/${s.id}`} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Eye size={15} /></a>
                          <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Pencil size={15} /></button>
                          <button onClick={() => remove(s.id, `${s.firstName} ${s.lastName}`)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.students.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Student' : 'Register Student'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['First Name', 'firstName', 'text'], ['Last Name', 'lastName', 'text'], ['Date of Birth', 'dateOfBirth', 'date'], ['Parent Name', 'parentName', 'text'], ['Parent Phone', 'parentPhone', 'tel'], ['Email', 'email', 'email']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class Stream</label>
              <select value={form.classStreamId} onChange={e => setForm({ ...form, classStreamId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select stream</option>
                {streamList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <textarea value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : editing ? 'Update' : 'Register'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
