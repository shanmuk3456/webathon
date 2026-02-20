'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
    
    // Listen for storage changes (e.g., when login happens in another tab)
    const handleStorageChange = () => {
      loadUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadUser]);

  const logout = async () => {
    try {
      // Clear backend session
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Force redirect to login page
    window.location.href = '/login';
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return { user, loading, logout, getToken, refreshUser };
}
