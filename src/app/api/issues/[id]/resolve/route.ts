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

  if (!isValidTransition(issue.status, 'RESOLVED')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'RESOLVED') },
      { status: 400 }
    );
  }

  try {
    const updatedIssue = await db.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: params.id },
        data: { status: IssueStatus.RESOLVED, resolvedAt: new Date() },
      });
      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.MARK_RESOLVED,
          fromStatus: issue.status,
          toStatus: 'RESOLVED',
        },
        tx
      );
      return updated;
    });

    if (issue.reporterId) {
      await sendPushToUser(
        issue.reporterId,
        {
          title: 'Issue resolved',
          body: `"${issue.title}" has been marked as resolved.`,
          url: `/issues/${params.id}`,
          tag: `resolve-${params.id}`,
        },
        { communityName: issue.communityName }
      );
    }

    return NextResponse.json({
      issue: updatedIssue,
      message: 'Issue marked as resolved',
    });
  } catch (error) {
    console.error('Resolve issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
