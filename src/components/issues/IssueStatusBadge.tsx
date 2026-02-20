import { Badge } from '@/components/ui/Badge';
import { IssueStatus } from '@/types';

interface IssueStatusBadgeProps {
  status: IssueStatus;
}

const statusLabels: Record<IssueStatus, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  VERIFIED_BY_NEIGHBOR: 'Verified',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export function IssueStatusBadge({ status }: IssueStatusBadgeProps) {
  return <Badge variant={status}>{statusLabels[status]}</Badge>;
}
