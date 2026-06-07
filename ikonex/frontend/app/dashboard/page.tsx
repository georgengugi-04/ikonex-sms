'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { assessments } from '@/lib/api';
import { DashboardStats } from '@/types';
import { Users, School, BookOpen, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    assessments.dashboard().then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here is what is happening at Ikonex Academy today.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl p-6 h-28 animate-pulse bg-gray-100" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={stats?.totalStudents ?? 0} sub="Registered students" color="bg-blue-100 text-blue-600" icon={<Users size={22} />} />
            <StatCard label="Class Streams" value={stats?.totalStreams ?? 0} sub="Active streams" color="bg-green-100 text-green-600" icon={<School size={22} />} />
            <StatCard label="Subjects" value={stats?.totalSubjects ?? 0} sub="Offered subjects" color="bg-purple-100 text-purple-600" icon={<BookOpen size={22} />} />
            <StatCard label="Avg Performance" value={`${stats?.averagePerformance ?? 0}%`} sub="School average" color="bg-orange-100 text-orange-600" icon={<TrendingUp size={22} />} />
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add Student', href: '/students', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Add Stream', href: '/streams', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'Add Subject', href: '/subjects', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: 'Enter Scores', href: '/assessments', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            ].map(a => (
              <a key={a.href} href={a.href} className={`p-4 rounded-xl text-sm font-medium text-center transition-colors ${a.color}`}>{a.label}</a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
