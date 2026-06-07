'use client';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
interface Props { title: string; }
export default function TopNav({ title }: Props) {
  const { user } = useAuth();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700"><Bell size={20} /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm text-gray-700 hidden md:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
