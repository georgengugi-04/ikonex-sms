'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { assessments as assessmentsApi, students as studentsApi, streams as streamsApi } from '@/lib/api';
import { Student, ClassStream } from '@/types';
import { FileDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [studentList, setStudentList] = useState<Student[]>([]);
  const [streamList, setStreamList] = useState<ClassStream[]>([]);
  const [streamFilter, setStreamFilter] = useState('');
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('TERM_1');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([studentsApi.list({ limit: 200 }), streamsApi.list()]).then(([sr, str]) => {
      setStudentList(sr.data.data.students);
      setStreamList(str.data.data);
    });
  }, []);

  const generateReport = async (student: Student) => {
    setGenerating(student.id);
    try {
      const res = await assessmentsApi.student(student.id, { term, academicYear: year });
      const { assessments: scores, total, average } = res.data.data;
      const { jsPDF } = (await import('jspdf')).default ? await import('jspdf') : require('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new (require('jspdf').jsPDF)();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('IKONEX ACADEMY', 105, 20, { align: 'center' });
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.text('Student Report Card', 105, 30, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      doc.setFontSize(10);
      doc.text(`Student: ${student.firstName} ${student.lastName}`, 20, 45);
      doc.text(`Adm No: ${student.admissionNo}`, 20, 52);
      doc.text(`Class: ${student.classStream?.name || ''}`, 20, 59);
      doc.text(`Term: ${term.replace('_', ' ')}  |  Year: ${year}`, 120, 45);
      autoTable(doc, {
        startY: 68,
        head: [['Subject', 'CAT (/40)', 'Exam (/60)', 'Total (/100)', 'Grade']],
        body: scores.map((a: any) => [a.subject?.name, a.catScore, a.examScore, a.total, a.grade]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 9 },
      });
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Marks: ${total}`, 20, finalY);
      doc.text(`Average Score: ${average}%`, 20, finalY + 7);
      doc.setFont('helvetica', 'italic');
      doc.text('Class Teacher Remarks: ___________________________', 20, finalY + 20);
      doc.save(`${student.admissionNo}_report.pdf`);
      toast.success('Report downloaded');
    } catch (err) { toast.error('Failed to generate report'); }
    finally { setGenerating(null); }
  };

  const generateClassReport = async () => {
    if (!streamFilter) return toast.error('Select a class stream');
    setGenerating('class');
    try {
      const res = await assessmentsApi.class(streamFilter, { term, academicYear: year });
      const ranked = res.data.data;
      const stream = streamList.find(s => s.id === streamFilter);
      const { jsPDF } = (await import('jspdf')).default ? await import('jspdf') : require('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new (require('jspdf').jsPDF)();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('IKONEX ACADEMY', 105, 20, { align: 'center' });
      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.text(`Class Performance Report — ${stream?.name}`, 105, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Term: ${term.replace('_', ' ')}  |  Year: ${year}`, 105, 38, { align: 'center' });
      autoTable(doc, {
        startY: 48,
        head: [['Pos', 'Adm No', 'Student Name', 'Total Marks', 'Average']],
        body: ranked.map((s: any) => [s.position, s.admissionNo, `${s.firstName} ${s.lastName}`, s.totalMarks, `${s.average}%`]),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 9 },
      });
      doc.save(`${stream?.name}_class_report.pdf`);
      toast.success('Class report downloaded');
    } catch { toast.error('Failed to generate class report'); }
    finally { setGenerating(null); }
  };

  const filtered = studentList.filter(s => {
    const match = search ? (`${s.firstName} ${s.lastName} ${s.admissionNo}`).toLowerCase().includes(search.toLowerCase()) : true;
    const stream = streamFilter ? s.classStreamId === streamFilter : true;
    return match && stream;
  });

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={streamFilter} onChange={e => setStreamFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Streams</option>
              {streamList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={term} onChange={e => setTerm(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="TERM_1">Term 1</option>
              <option value="TERM_2">Term 2</option>
              <option value="TERM_3">Term 3</option>
            </select>
            <input value={year} onChange={e => setYear(e.target.value)} placeholder="Year"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={generateClassReport} disabled={generating === 'class'}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60">
              <FileDown size={15} /> {generating === 'class' ? 'Generating...' : 'Class Report PDF'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
                className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Adm No', 'Student Name', 'Class', 'Action'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.admissionNo}</td>
                  <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{s.classStream?.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => generateReport(s)} disabled={generating === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-60">
                      <FileDown size={13} /> {generating === s.id ? 'Generating...' : 'PDF Report'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
