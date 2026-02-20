import { NextRequest, NextResponse } from 'next/server';
import { requireAdminIssueAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendPushToUser } from '@/lib/push';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';
import { assertPointsOnlyOnTransition } from '@/lib/civic-points';

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
    const pts = assertPointsOnlyOnTransition(issue.status, 'CLOSED', issue.pointsAwarded);

    await db.$transaction(async (tx) => {
      if (pts && pts.points < 0) {
        await tx.user.update({
          where: { id: issue.reporterId },
          data: { civicPoints: { decrement: 200 }, weeklyPoints: { decrement: 200 } },
        });
      }
      await tx.issue.update({
        where: { id: params.id },
        data: { status: IssueStatus.CLOSED, closedAt: new Date() },
      });
      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.REJECT,
          fromStatus: issue.status,
          toStatus: 'CLOSED',
          pointsChange: pts?.points ?? -200,
        },
        tx
      );
    });

    await sendPushToUser(
      issue.reporterId,
      {
        title: 'Issue rejected',
        body: `Your issue "${issue.title}" was rejected. -200 civic points applied.`,
        url: `/issues/${params.id}`,
        tag: `reject-${params.id}`,
      },
      { communityName: issue.communityName }
    );

    return NextResponse.json({
      message: 'Issue rejected. -200 civic points applied to reporter.',
    });
  } catch (error) {
    console.error('Reject issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
