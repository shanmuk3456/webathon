'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IssueStatusBadge } from '@/components/issues/IssueStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const ADMIN_SECTION_KEYS = [
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
] as const;

const SECTION_LABELS: Record<(typeof ADMIN_SECTION_KEYS)[number], string> = {
  PENDING_APPROVAL: 'Pending Issues',
  APPROVED: 'Approved Issues',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

interface IssueItem {
  id: string;
  title: string;
  description: string;
  status: string;
  urgency?: string;
  imageUrl?: string | null;
  reporter?: { name: string };
<<<<<<< HEAD
  createdAt: Date | string;
  supportCount?: number;
=======
  createdAt: string;
>>>>>>> 017bcdc (deploy)
}

interface AdminIssueSectionProps {
  status: (typeof ADMIN_SECTION_KEYS)[number];
  issues: IssueItem[];
  loading: boolean;
  onAction: () => void;
}

export function AdminIssueSection({
  status,
  issues,
  loading,
  onAction,
}: AdminIssueSectionProps) {
  const { getToken } = useAuth();
  const label = SECTION_LABELS[status];

  const [actionError, setActionError] = useState<string | null>(null);

  const callApi = async (path: string) => {
    setActionError(null);
    try {
      const token = getToken();
      const res = await fetch(path, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      onAction();
    } catch (e: any) {
      setActionError(e.message || 'Action failed');
    }
  };

  return (
    <section>
      {actionError && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs sm:text-sm">
          {actionError}
        </div>
      )}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        {label}
        <span className="text-xs sm:text-sm font-normal text-gray-500">({issues.length})</span>
      </h2>
      {loading ? (
        <p className="text-gray-500 text-xs sm:text-sm">Loading...</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-500 text-xs sm:text-sm">No issues</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      href={`/admin/issues/${issue.id}`}
                      className="font-medium text-sm sm:text-base text-gray-900 hover:text-blue-600 break-words"
                    >
                      {issue.title}
                    </Link>
                    {issue.urgency === 'URGENT' && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-red-100 text-red-800 shrink-0">
                        Urgent
                      </span>
                    )}
                    <IssueStatusBadge status={issue.status as any} />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                    {issue.reporter?.name} · {new Date(issue.createdAt).toLocaleDateString()}
                    {issue.supportCount != null && issue.supportCount > 1 && (
                      <span className="text-blue-700 font-medium">· {issue.supportCount} support</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {status === 'PENDING_APPROVAL' && (
                    <>
                      <Button
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 flex-1 sm:flex-none min-w-[120px]"
                        onClick={() => callApi(`/api/issues/${issue.id}/approve`)}
                      >
                        Approve (+10)
                      </Button>
                      <Button
                        variant="danger"
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 flex-1 sm:flex-none min-w-[120px]"
                        onClick={() => callApi(`/api/issues/${issue.id}/reject`)}
                      >
                        Reject (-200)
                      </Button>
                    </>
                  )}
                  {(status === 'APPROVED' && (issue.status === 'APPROVED' || issue.status === 'VERIFIED_BY_NEIGHBOR')) && (
                    <Button
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 w-full sm:w-auto"
                      onClick={() => callApi(`/api/issues/${issue.id}/progress`)}
                    >
                      Mark In Progress
                    </Button>
                  )}
                  {status === 'IN_PROGRESS' && (
                    <Button
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 w-full sm:w-auto"
                      onClick={() => callApi(`/api/issues/${issue.id}/resolve`)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {status === 'RESOLVED' && (
                    <Button
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 w-full sm:w-auto"
                      onClick={() => callApi(`/api/issues/${issue.id}/close`)}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
