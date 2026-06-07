'use client';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, getToken, clearAuth } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (u && t) setUser(u);
    setLoading(false);
  }, []);
  const logout = () => { clearAuth(); window.location.href = '/login'; };
  return { user, loading, isAuthenticated: !!user, logout };
}
