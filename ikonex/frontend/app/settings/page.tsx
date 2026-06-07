'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { grading as gradingApi } from '@/lib/api';
import { GradingScale } from '@/types';
import { Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_SCALES: GradingScale[] = [
  { grade: 'A', minMark: 80, maxMark: 100, points: 12 },
  { grade: 'B', minMark: 70, maxMark: 79, points: 11 },
  { grade: 'C', minMark: 60, maxMark: 69, points: 10 },
  { grade: 'D', minMark: 50, maxMark: 59, points: 7 },
  { grade: 'E', minMark: 0, maxMark: 49, points: 4 },
];

export default function SettingsPage() {
  const [scales, setScales] = useState<GradingScale[]>(DEFAULT_SCALES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    gradingApi.list().then(r => {
      if (r.data.data.length > 0) setScales(r.data.data);
    }).catch(() => {});
  }, []);

  const update = (i: number, field: keyof GradingScale, value: any) => {
    setScales(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const save = async () => {
    setSaving(true);
    try {
      await gradingApi.update(scales);
      toast.success('Grading scales saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Grading Scale</h3>
              <p className="text-sm text-gray-500 mt-0.5">Configure grade boundaries used across all assessments</p>
            </div>
            <button onClick={() => setScales([...scales, { grade: '', minMark: 0, maxMark: 0, points: 0 }])}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
              <Plus size={14} /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500 px-1">
              {['Grade', 'Min Mark', 'Max Mark', 'Points', ''].map(h => <div key={h}>{h}</div>)}
            </div>
            {scales.map((scale, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <input value={scale.grade} onChange={e => update(i, 'grade', e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold" />
                <input type="number" value={scale.minMark} onChange={e => update(i, 'minMark', Number(e.target.value))}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={scale.maxMark} onChange={e => update(i, 'maxMark', Number(e.target.value))}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={scale.points} onChange={e => update(i, 'points', Number(e.target.value))}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => setScales(scales.filter((_, idx) => idx !== i))}
                  className="p-1.5 hover:bg-red-50 rounded text-red-400 flex justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving}
            className="mt-5 flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Grading Scale'}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-1">System Info</h3>
          <p className="text-sm text-gray-500">Ikonex Academy Student Management System</p>
          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <div className="flex gap-2"><span className="text-gray-400">Version:</span> 1.0.0</div>
            <div className="flex gap-2"><span className="text-gray-400">Built with:</span> Next.js 15, Node.js, Prisma, MySQL</div>
            <div className="flex gap-2"><span className="text-gray-400">Developer:</span> Ikonex Systems Internship Assessment</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
