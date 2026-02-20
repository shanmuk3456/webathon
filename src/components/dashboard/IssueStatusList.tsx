'use client';

import { Card } from '@/components/ui/Card';
import { useIssues } from '@/hooks/useIssues';
import Link from 'next/link';
import { IssueStatus } from '@/types';
import { Clock, CheckCircle, AlertCircle, XCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  VERIFIED_BY_NEIGHBOR: {
    label: 'Verified',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: PlayCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  RESOLVED: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  CLOSED: {
    label: 'Closed',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export function IssueStatusList() {
  const { issues } = useIssues();

  const groupedByStatus = issues.reduce((acc, issue) => {
    const status = issue.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(issue);
    return acc;
  }, {} as Record<string, typeof issues>);

  const statusOrder: IssueStatus[] = [
    'PENDING_APPROVAL',
    'APPROVED',
    'VERIFIED_BY_NEIGHBOR',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
  ];

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4 text-black">Issue Status</h3>
      <div className="space-y-3">
        {statusOrder.map((status) => {
          const issuesForStatus = groupedByStatus[status] || [];
          const config = statusConfig[status] || {
            label: status,
            icon: AlertCircle,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
          };
          const Icon = config.icon;

          if (issuesForStatus.length === 0) return null;

          return (
            <Link
              key={status}
              href={`/issues?status=${status}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', config.bgColor)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{config.label}</p>
                    <p className="text-xs text-black">
                      {issuesForStatus.length} issue{issuesForStatus.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-black">
                  {issuesForStatus.length}
                </span>
              </div>
            </Link>
          );
        })}
        {issues.length === 0 && (
          <p className="text-sm text-black text-center py-4">No issues yet</p>
        )}
      </div>
    </Card>
  );
}
