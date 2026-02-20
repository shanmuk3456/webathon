'use client';

import { StatsCard } from './StatsCard';
import { useIssues } from '@/hooks/useIssues';
import { IssueStatus } from '@/types';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export function IssueStatusCards() {
  const { issues: allIssues } = useIssues();
  const { issues: pendingIssues } = useIssues('PENDING_APPROVAL');
  const { issues: inProgressIssues } = useIssues('IN_PROGRESS');
  const { issues: resolvedIssues } = useIssues('RESOLVED');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Issues"
        value={allIssues.length}
        icon={<AlertCircle className="w-8 h-8" />}
      />
      <StatsCard
        title="Pending Approval"
        value={pendingIssues.length}
        icon={<Clock className="w-8 h-8" />}
      />
      <StatsCard
        title="In Progress"
        value={inProgressIssues.length}
        icon={<AlertCircle className="w-8 h-8" />}
      />
      <StatsCard
        title="Resolved"
        value={resolvedIssues.length}
        icon={<CheckCircle className="w-8 h-8" />}
      />
    </div>
  );
}
