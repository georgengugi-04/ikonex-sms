'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Toaster } from 'react-hot-toast';
interface Props { children: React.ReactNode; title: string; }
export default function DashboardLayout({ children, title }: Props) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.push('/login'); }, [loading, isAuthenticated, router]);
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated) return null;
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
