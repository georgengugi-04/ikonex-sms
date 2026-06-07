'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { assessments as assessmentsApi, students as studentsApi, subjects as subjectsApi, streams as streamsApi } from '@/lib/api';
import { Student, Subject, ClassStream, Assessment } from '@/types';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TERMS = ['TERM_1', 'TERM_2', 'TERM_3'];
const YEAR = new Date().getFullYear().toString();

export default function AssessmentsPage() {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [streamList, setStreamList] = useState<ClassStream[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentAssessments, setStudentAssessments] = useState<Assessment[]>([]);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('');
  const [form, setForm] = useState({ studentId: '', subjectId: '', catScore: 0, examScore: 0, term: 'TERM_1', academicYear: YEAR });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([studentsApi.list({ limit: 200 }), subjectsApi.list(), streamsApi.list()]).then(([sr, subr, str]) => {
      setStudentList(sr.data.data.students);
      setSubjectList(subr.data.data);
      setStreamList(str.data.data);
    });
  }, []);

  const selectStudent = async (s: Student) => {
    setSelectedStudent(s);
    const res = await assessmentsApi.student(s.id);
    setStudentAssessments(res.data.data.assessments);
  };

  const save = async () => {
    if (!form.studentId || !form.subjectId) return toast.error('Select student and subject');
    setSaving(true);
    try {
      await assessmentsApi.create(form);
      toast.success('Score recorded');
      setModal(false);
      if (selectedStudent) selectStudent(selectedStudent);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const filtered = studentList.filter(s => {
    const match = search ? (`${s.firstName} ${s.lastName} ${s.admissionNo}`).toLowerCase().includes(search.toLowerCase()) : true;
    const stream = streamFilter ? s.classStreamId === streamFilter : true;
    return match && stream;
  });

  return (
    <DashboardLayout title="Assessments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={streamFilter} onChange={e => setStreamFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All streams</option>
              {streamList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto">
            {filtered.map(s => (
              <button key={s.id} onClick={() => selectStudent(s)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 text-sm hover:bg-gray-50 transition-colors ${selectedStudent?.id === s.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''}`}>
                <div className="font-medium">{s.firstName} {s.lastName}</div>
                <div className="text-xs text-gray-500">{s.admissionNo} · {s.classStream?.name}</div>
              </button>
            ))}
            {filtered.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">No students found</div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedStudent ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.admissionNo} · {selectedStudent.classStream?.name}</p>
                </div>
                <button onClick={() => { setForm({ ...form, studentId: selectedStudent.id }); setModal(true); }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  <Plus size={15} /> Add Score
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Subject', 'CAT /40', 'Exam /60', 'Total /100', 'Grade', 'Term'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentAssessments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{a.subject?.name}</td>
                        <td className="px-4 py-3">{a.catScore}</td>
                        <td className="px-4 py-3">{a.examScore}</td>
                        <td className="px-4 py-3 font-semibold">{a.total}</td>
                        <td className="px-4 py-3"><Badge text={a.grade} /></td>
                        <td className="px-4 py-3 text-gray-500">{a.term.replace('_', ' ')}</td>
                      </tr>
                    ))}
                    {studentAssessments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No scores recorded yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p>Select a student to view and manage their scores</p>
            </div>
          )}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Record Score">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
            <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select subject</option>
              {subjectList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CAT Score (0-40)</label>
              <input type="number" min={0} max={40} value={form.catScore} onChange={e => setForm({ ...form, catScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Exam Score (0-60)</label>
              <input type="number" min={0} max={60} value={form.examScore} onChange={e => setForm({ ...form, examScore: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            Total: <span className="font-bold text-lg">{form.catScore + form.examScore}</span> / 100
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
              <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TERMS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
              <input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : 'Record Score'}
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
