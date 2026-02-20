'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { AdminActions } from '@/components/admin/AdminActions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminIssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [issue, setIssue] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
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

      const auditRes = await fetch(`/api/issues/${params.id}/audit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const auditData = await auditRes.json();
      setAuditLogs(auditData.auditLogs || []);
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
      <Link href="/admin/issues">
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Issues
        </Button>
      </Link>

      <Card>
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
          <IssueStatusBadge status={issue.status} />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Description
            </h3>
            <p className="text-gray-900">{issue.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Reported By
              </h3>
              <p className="text-gray-900">
                {issue.reporter?.name || 'Unknown'} ({issue.reporter?.email})
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
                {issue.verifiedAt && (
                  <p className="text-sm text-gray-500">
                    {new Date(issue.verifiedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {issue.status === 'VERIFIED_BY_NEIGHBOR' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <p className="text-purple-800 font-semibold">
                ✓ Verified. Allocate resources.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <AdminActions
              issueId={issue.id}
              currentStatus={issue.status}
              onStatusChange={fetchIssue}
            />
          </div>

          {auditLogs.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Audit log</h3>
              <ul className="space-y-2 text-sm">
                {auditLogs.map((log: any) => (
                  <li key={log.id} className="text-gray-600">
                    <span className="font-medium text-gray-800">{log.action}</span>
                    {' '}
                    {log.fromStatus} → {log.toStatus}
                    {log.pointsChange != null && (
                      <span className={log.pointsChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}({log.pointsChange >= 0 ? '+' : ''}{log.pointsChange} pts)
                      </span>
                    )}
                    {' · '}
                    {new Date(log.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
