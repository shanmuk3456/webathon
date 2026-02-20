import { NextRequest, NextResponse } from 'next/server';
import { requireAdminIssueAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendPushToUser } from '@/lib/push';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireAdminIssueAccess(request, params.id);
  if (access instanceof NextResponse) return access;
  const { user, issue } = access;

  if (!isValidTransition(issue.status, 'IN_PROGRESS')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'IN_PROGRESS') },
      { status: 400 }
    );
  }

  try {
    const updatedIssue = await db.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: params.id },
        data: { status: IssueStatus.IN_PROGRESS, inProgressAt: new Date() },
      });
      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.MARK_IN_PROGRESS,
          fromStatus: issue.status,
          toStatus: 'IN_PROGRESS',
        },
        tx
      );
      return updated;
    });

    if (issue.reporterId) {
      await sendPushToUser(
        issue.reporterId,
        {
          title: 'Status update',
          body: `"${issue.title}" is now in progress.`,
          url: `/issues/${params.id}`,
          tag: `progress-${params.id}`,
        },
        { communityName: issue.communityName }
      );
    }

    return NextResponse.json({
      issue: updatedIssue,
      message: 'Issue marked as in progress',
    });
  } catch (error) {
    console.error('Mark progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
