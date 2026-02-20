import { NextRequest, NextResponse } from 'next/server';
import { requireAdminIssueAccess } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { calculateDistance } from '@/lib/utils';
import { sendPushToUser } from '@/lib/push';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';
import { assertPointsOnlyOnTransition } from '@/lib/civic-points';

const VERIFICATION_RADIUS = Number(process.env.VERIFICATION_RADIUS_METERS) || 500;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireAdminIssueAccess(request, params.id);
  if (access instanceof NextResponse) return access;
  const { user, issue } = access;

  if (!isValidTransition(issue.status, 'APPROVED')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'APPROVED') },
      { status: 400 }
    );
  }

  try {
    let assignedVerifierId: string | null = null;
    const updatedIssue = await db.$transaction(async (tx) => {
      const pts = assertPointsOnlyOnTransition(
        issue.status,
        'APPROVED',
        issue.pointsAwarded
      );

      const updated = await tx.issue.update({
        where: { id: params.id },
        data: {
          status: IssueStatus.APPROVED,
          approvedAt: new Date(),
          adminId: user.userId,
          ...(pts ? { pointsAwarded: true } : {}),
        },
      });

      const candidates = await tx.user.findMany({
        where: {
          communityName: issue.communityName,
          role: 'USER',
          id: { not: issue.reporterId },
          lastLatitude: { not: null },
          lastLongitude: { not: null },
        },
        select: { id: true, lastLatitude: true, lastLongitude: true },
      });

      let bestDistance = Infinity;
      for (const c of candidates) {
        const dist = calculateDistance(
          issue.latitude,
          issue.longitude,
          c.lastLatitude!,
          c.lastLongitude!
        );
        if (dist <= VERIFICATION_RADIUS && dist < bestDistance) {
          bestDistance = dist;
          assignedVerifierId = c.id;
        }
      }

      if (assignedVerifierId) {
        await tx.issue.update({
          where: { id: params.id },
          data: { assignedVerifierId },
        });
        await tx.notification.create({
          data: {
            userId: assignedVerifierId,
            issueId: params.id,
            type: 'VERIFY_REQUEST',
            message: `Please verify this issue near you: "${issue.title}".`,
          },
        });
      }

      if (pts && pts.points > 0) {
        await tx.user.update({
          where: { id: issue.reporterId },
          data: { civicPoints: { increment: pts.points }, weeklyPoints: { increment: pts.points } },
        });
      }

      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.APPROVE,
          fromStatus: issue.status,
          toStatus: 'APPROVED',
          pointsChange: pts?.points ?? null,
        },
        tx
      );
      return updated;
    });

    await sendPushToUser(
      issue.reporterId,
      {
        title: 'Issue approved',
        body: `Your issue "${issue.title}" has been approved. +10 civic points.`,
        url: `/issues/${params.id}`,
        tag: `approve-${params.id}`,
      },
      { communityName: issue.communityName }
    );
    if (assignedVerifierId) {
      await sendPushToUser(
        assignedVerifierId,
        {
          title: 'Verification requested',
          body: `Please verify this issue near you: "${issue.title}".`,
          url: `/issues/${params.id}`,
          tag: `verify-${params.id}`,
        },
        { communityName: issue.communityName }
      );
    }

    return NextResponse.json({
      issue: updatedIssue,
      message: 'Issue approved. +10 points awarded to reporter.',
    });
  } catch (error) {
    console.error('Approve issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
