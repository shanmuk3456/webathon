import { NextRequest, NextResponse } from 'next/server';
import { requireAdminIssueAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireAdminIssueAccess(request, params.id);
  if (access instanceof NextResponse) return access;
  const { user, issue } = access;

  if (!isValidTransition(issue.status, 'CLOSED')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'CLOSED') },
      { status: 400 }
    );
  }

  try {
    const updatedIssue = await db.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: params.id },
        data: { status: IssueStatus.CLOSED, closedAt: new Date() },
      });
      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.CLOSE,
          fromStatus: issue.status,
          toStatus: 'CLOSED',
        },
        tx
      );
      return updated;
    });

    return NextResponse.json({
      issue: updatedIssue,
      message: 'Issue closed',
    });
  } catch (error) {
    console.error('Close issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
