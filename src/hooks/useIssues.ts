'use client';

import { useState, useEffect } from 'react';
import { Issue, IssueStatus } from '@/types';
import { useAuth } from './useAuth';

export function useIssues(status?: IssueStatus) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchIssues();
  }, [status]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const url = status
        ? `/api/issues?status=${status}`
        : '/api/issues';
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }

      const data = await response.json();
      setIssues(data.issues || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { issues, loading, error, refetch: fetchIssues };
}
