'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IssueStatus } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface AdminActionsProps {
  issueId: string;
  currentStatus: IssueStatus;
  onStatusChange: () => void;
}

export function AdminActions({
  issueId,
  currentStatus,
  onStatusChange,
}: AdminActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  const handleAction = async (action: string) => {
    setLoading(action);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(`/api/issues/${issueId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} issue`);
      }

      onStatusChange();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} issue`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {currentStatus === 'PENDING_APPROVAL' && (
          <>
            <Button
              variant="primary"
              onClick={() => handleAction('approve')}
              disabled={loading === 'approve'}
            >
              {loading === 'approve' ? 'Approving...' : 'Approve (+10 pts)'}
            </Button>
            <Button
              variant="danger"
              onClick={() => handleAction('reject')}
              disabled={loading === 'reject'}
            >
              {loading === 'reject' ? 'Rejecting...' : 'Reject (-200 pts)'}
            </Button>
          </>
        )}

        {currentStatus === 'VERIFIED_BY_NEIGHBOR' && (
          <Button
            variant="primary"
            onClick={() => handleAction('progress')}
            disabled={loading === 'progress'}
          >
            {loading === 'progress' ? 'Updating...' : 'Mark In Progress'}
          </Button>
        )}

        {currentStatus === 'IN_PROGRESS' && (
          <Button
            variant="primary"
            onClick={() => handleAction('resolve')}
            disabled={loading === 'resolve'}
          >
            {loading === 'resolve' ? 'Resolving...' : 'Mark Resolved'}
          </Button>
        )}

        {currentStatus === 'RESOLVED' && (
          <Button
            variant="primary"
            onClick={() => handleAction('close')}
            disabled={loading === 'close'}
          >
            {loading === 'close' ? 'Closing...' : 'Close Issue'}
          </Button>
        )}

        {(currentStatus === 'APPROVED' ||
          currentStatus === 'VERIFIED_BY_NEIGHBOR') && (
          <Button
            variant="danger"
            onClick={() => handleAction('false-alarm')}
            disabled={loading === 'false-alarm'}
          >
            {loading === 'false-alarm' ? 'Processing...' : 'Mark False Alarm'}
          </Button>
        )}
      </div>
    </div>
  );
}
