'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { IssueStatus } from '@/types';

interface VerificationButtonProps {
  issueId: string;
  status: IssueStatus;
  onVerified?: () => void;
}

export function VerificationButton({
  issueId,
  status,
  onVerified,
}: VerificationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  const handleVerify = async () => {
    if (status !== 'APPROVED') {
      setError('Only approved issues can be verified');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser.');
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const token = getToken();
      const response = await fetch(`/api/issues/${issueId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify issue');
      }

      if (onVerified) {
        onVerified();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify issue');
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'APPROVED') {
    return null;
  }

  return (
    <div>
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}
      <Button
        variant="primary"
        onClick={handleVerify}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify Issue'}
      </Button>
    </div>
  );
}
