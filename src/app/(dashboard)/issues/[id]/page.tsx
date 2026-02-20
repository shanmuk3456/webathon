'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { VerificationButton } from '@/components/issues/VerificationButton';
import { ResolutionVerificationButton } from '@/components/issues/ResolutionVerificationButton';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, getToken } = useAuth();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssue();
  }, [params.id]);

  const fetchIssue = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/api/issues/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }

      const data = await response.json();
      setIssue(data.issue);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Issue not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/issues">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Issues
        </Button>
      </Link>

      <Card>
        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{issue.title}</h1>
          <div className="flex items-center gap-2">
            {issue.urgency === 'URGENT' && (
              <span className="px-2 py-1 text-sm font-semibold rounded bg-red-100 text-red-800">Urgent</span>
            )}
            <IssueStatusBadge status={issue.status} />
          </div>
        </div>

        {issue.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={issue.imageUrl}
              alt="Issue"
              className="w-full max-h-80 object-cover"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Description
            </h3>
            <p className="text-gray-900">{issue.description}</p>
          </div>

          {issue.supportCount != null && issue.supportCount > 1 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm font-medium text-blue-800">
                {issue.supportCount} people reported a similar issue nearby (merged as support)
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Reported By
              </h3>
              <p className="text-gray-900">
                {issue.reporter?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Reported On
              </h3>
              <p className="text-gray-900">
                {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Location
              </h3>
              <p className="text-gray-900">
                {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
              </p>
            </div>
            {issue.verifier && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Verified By
                </h3>
                <p className="text-gray-900">{issue.verifier.name}</p>
              </div>
            )}
          </div>

          {user?.role === 'USER' && (
            <div className="mt-6 pt-6 border-t">
              <VerificationButton
                issueId={issue.id}
                status={issue.status}
                onVerified={fetchIssue}
              />
              <div className="mt-3">
                <ResolutionVerificationButton
                  issueId={issue.id}
                  status={issue.status}
                  onVerified={fetchIssue}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
