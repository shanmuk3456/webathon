import { NextRequest, NextResponse } from 'next/server';
import { requireIssueAccess, requireUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { calculateDistance } from '@/lib/utils';
import { verifyIssueResolutionSchema } from '@/lib/validations';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendPushToUser } from '@/lib/push';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';
import { checkVerificationRateLimit } from '@/lib/rate-limit';

const VERIFICATION_RADIUS = Number(process.env.VERIFICATION_RADIUS_METERS) || 500;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireIssueAccess(request, params.id);
  if (access instanceof NextResponse) return access;
  const { user, issue } = access;

  if (!requireUser(user)) {
    return NextResponse.json(
      { error: 'Only community members can verify resolution' },
      { status: 403 }
    );
  }

  const rateLimit = await checkVerificationRateLimit(user.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  if (!isValidTransition(issue.status, 'CLOSED')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'CLOSED') },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { latitude: userLat, longitude: userLon } = verifyIssueResolutionSchema.parse(body);

    const distToIssue = calculateDistance(
      issue.latitude,
      issue.longitude,
      userLat,
      userLon
    );
    if (distToIssue > VERIFICATION_RADIUS) {
      return NextResponse.json(
        { error: 'You must be within 500m of the issue to verify resolution.' },
        { status: 403 }
      );
    }

    const existing = await db.verification.findUnique({
      where: {
        issueId_userId_kind: { issueId: params.id, userId: user.userId, kind: 'RESOLUTION' },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already verified the resolution.' },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      await tx.verification.create({
        data: {
          issueId: params.id,
          userId: user.userId,
          verified: true,
          kind: 'RESOLUTION',
        },
      });

      await tx.user.update({
        where: { id: user.userId },
        data: { civicPoints: { increment: 5 }, weeklyPoints: { increment: 5 } },
      });

      const updated = await tx.issue.update({
        where: { id: params.id },
        data: { status: IssueStatus.CLOSED, closedAt: new Date() },
      });

      const adminId = issue.adminId
        ? issue.adminId
        : (await tx.user.findFirst({
            where: { role: 'ADMIN', communityName: issue.communityName },
            select: { id: true },
          }))?.id;
      if (adminId) {
        await tx.notification.create({
          data: {
            userId: adminId,
            issueId: params.id,
            type: 'ADMIN_INFO',
            message: 'Resolution verified by a nearby user. Issue closed.',
          },
        });
      }

      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.USER_VERIFY_RESOLUTION_CLOSE,
          fromStatus: issue.status,
          toStatus: 'CLOSED',
        },
        tx
      );

      return updated;
    });

    if (issue.reporterId) {
      await sendPushToUser(
        issue.reporterId,
        {
          title: 'Resolution verified',
          body: `"${issue.title}" resolution was verified. Issue is now closed.`,
          url: `/issues/${params.id}`,
          tag: `resolution-verified-${params.id}`,
        },
        { communityName: issue.communityName }
      );
    }

    return NextResponse.json({
      issue: result,
      message: 'Resolution verified. Issue is now CLOSED.',
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Verify resolution error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
