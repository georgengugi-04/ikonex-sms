'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import { students as studentsApi, assessments as assessmentsApi } from '@/lib/api';
import { Student, Assessment } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function StudentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState({ total: 0, average: '0' });

  useEffect(() => {
    Promise.all([studentsApi.get(id), assessmentsApi.student(id)]).then(([sr, ar]) => {
      setStudent(sr.data.data);
      setAssessments(ar.data.data.assessments);
      setStats({ total: ar.data.data.total, average: ar.data.data.average });
    });
  }, [id]);

  if (!student) return <DashboardLayout title="Student"><div className="flex justify-center pt-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div></DashboardLayout>;

  return (
    <DashboardLayout title="Student Profile">
      <div className="space-y-6 max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Students
        </button>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {student.firstName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.firstName} {student.lastName}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{student.admissionNo} · {student.classStream?.name}</p>
              <div className="flex gap-3 mt-2"><Badge text={student.gender} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Marks</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-700">{stats.average}%</p>
                <p className="text-xs text-gray-500">Average</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
            {[['Parent', student.parentName], ['Phone', student.parentPhone], ['Email', student.email || '—'],
              ['DOB', new Date(student.dateOfBirth).toLocaleDateString()], ['Address', student.address || '—']].map(([l, v]) => (
              <div key={l}><p className="text-xs text-gray-400">{l}</p><p className="font-medium mt-0.5">{v}</p></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold">Assessment Results</h3></div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Subject', 'CAT', 'Exam', 'Total', 'Grade', 'Term', 'Year'].map(h =>
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assessments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.subject?.name}</td>
                  <td className="px-4 py-3">{a.catScore}</td>
                  <td className="px-4 py-3">{a.examScore}</td>
                  <td className="px-4 py-3 font-semibold">{a.total}</td>
                  <td className="px-4 py-3"><Badge text={a.grade} /></td>
                  <td className="px-4 py-3 text-gray-500">{a.term.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500">{a.academicYear}</td>
                </tr>
              ))}
              {assessments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No assessments recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
