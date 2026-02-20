import { db } from '@/lib/db';

export const AUDIT_ACTIONS = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  MARK_IN_PROGRESS: 'MARK_IN_PROGRESS',
  MARK_RESOLVED: 'MARK_RESOLVED',
  CLOSE: 'CLOSE',
  FALSE_ALARM: 'FALSE_ALARM',
  USER_VERIFY_EXISTENCE: 'USER_VERIFY_EXISTENCE',
  USER_VERIFY_RESOLUTION_CLOSE: 'USER_VERIFY_RESOLUTION_CLOSE',
} as const;

type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

type AuditClient = Pick<typeof db, 'issueAuditLog'>;

export async function createAuditLog(
  params: {
    issueId: string;
    performedBy: string;
    action: AuditAction;
    fromStatus: string;
    toStatus: string;
    pointsChange?: number | null;
  },
  tx?: AuditClient
): Promise<void> {
  const client = tx ?? db;
  await client.issueAuditLog.create({
    data: {
      issueId: params.issueId,
      performedBy: params.performedBy,
      action: params.action,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      pointsChange: params.pointsChange ?? null,
    },
  });
}
