'use client';

import { useIssues } from '@/hooks/useIssues';
import { AdminIssueCard } from '@/components/admin/AdminIssueCard';
import { useState } from 'react';
import { IssueStatus } from '@/types';

export default function AdminIssuesPage() {
  const [filter, setFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const { issues: allIssues } = useIssues();
  const { issues: pendingIssues } = useIssues('PENDING_APPROVAL');
  const { issues: approvedIssues } = useIssues('APPROVED');
  const { issues: verifiedIssues } = useIssues('VERIFIED_BY_NEIGHBOR');
  const { issues: inProgressIssues } = useIssues('IN_PROGRESS');
  const { issues: resolvedIssues } = useIssues('RESOLVED');

  const getFilteredIssues = () => {
    switch (filter) {
      case 'PENDING_APPROVAL':
        return pendingIssues;
      case 'APPROVED':
        return approvedIssues;
      case 'VERIFIED_BY_NEIGHBOR':
        return verifiedIssues;
      case 'IN_PROGRESS':
        return inProgressIssues;
      case 'RESOLVED':
        return resolvedIssues;
      default:
        return allIssues;
    }
  };

  const issues = getFilteredIssues();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manage Issues</h1>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value as IssueStatus | 'ALL')}
        >
          <option value="ALL">All Issues</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="VERIFIED_BY_NEIGHBOR">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {issues.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">
            No issues found for the selected filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue: any) => (
            <AdminIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
