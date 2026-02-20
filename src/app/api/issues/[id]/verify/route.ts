import { NextRequest, NextResponse } from 'next/server';
import { requireIssueAccess, requireUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { IssueStatus } from '@/types';
import { calculateDistance } from '@/lib/utils';
import { verifyIssueExistenceSchema } from '@/lib/validations';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';
import { sendPushToUser } from '@/lib/push';
import { isValidTransition, getTransitionError } from '@/lib/issue-state-machine';
import { checkVerificationRateLimit } from '@/lib/rate-limit';

const VERIFICATION_RADIUS = Number(process.env.VERIFICATION_RADIUS_METERS) || 500;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireIssueAccess(request, params.id);
  if (authResult instanceof NextResponse) return authResult;
  const { user, issue } = authResult;

  if (!requireUser(user)) {
    return NextResponse.json({ error: 'Only community members can verify issues' }, { status: 403 });
  }

  const rateLimit = await checkVerificationRateLimit(user.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  if (issue.reporterId === user.userId) {
    return NextResponse.json({ error: 'You cannot verify an issue you raised' }, { status: 400 });
  }

  if (!isValidTransition(issue.status, 'VERIFIED_BY_NEIGHBOR')) {
    return NextResponse.json(
      { error: getTransitionError(issue.status, 'VERIFIED_BY_NEIGHBOR') },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { latitude: userLat, longitude: userLon } = verifyIssueExistenceSchema.parse(body);

    const distToIssue = calculateDistance(
      issue.latitude,
      issue.longitude,
      userLat,
      userLon
    );
    if (distToIssue > VERIFICATION_RADIUS) {
      return NextResponse.json(
        { error: 'You must be within 500m of the issue location to verify.' },
        { status: 403 }
      );
    }

    if (issue.assignedVerifierId && issue.assignedVerifierId !== user.userId) {
      return NextResponse.json(
        { error: 'Only the nearest assigned user can verify this issue.' },
        { status: 403 }
      );
    }

    if (!issue.assignedVerifierId) {
      const candidates = await db.user.findMany({
        where: {
          communityName: user.communityName,
          role: 'USER',
          id: { not: issue.reporterId },
          lastLatitude: { not: null },
          lastLongitude: { not: null },
        },
        select: { id: true, lastLatitude: true, lastLongitude: true },
      });

      let nearestId: string | null = null;
      let best = Infinity;
      for (const c of candidates) {
        const d = calculateDistance(
          issue.latitude,
          issue.longitude,
          c.lastLatitude!,
          c.lastLongitude!
        );
        if (d <= VERIFICATION_RADIUS && d < best) {
          best = d;
          nearestId = c.id;
        }
      }
      if (nearestId && nearestId !== user.userId) {
        return NextResponse.json(
          { error: 'Only the nearest user within 500m can verify this issue.' },
          { status: 403 }
        );
      }
    }

    const existingVerification = await db.verification.findUnique({
      where: {
        issueId_userId_kind: { issueId: params.id, userId: user.userId, kind: 'EXISTENCE' },
      },
    });
    if (existingVerification) {
      return NextResponse.json({ error: 'You have already verified this issue' }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      await tx.verification.create({
        data: {
          issueId: params.id,
          userId: user.userId,
          verified: true,
          kind: 'EXISTENCE',
        },
      });

      await tx.user.update({
        where: { id: user.userId },
        data: { civicPoints: { increment: 5 }, weeklyPoints: { increment: 5 } },
      });

      const updated = await tx.issue.update({
        where: { id: params.id },
        data: {
          status: IssueStatus.VERIFIED_BY_NEIGHBOR,
          verifiedAt: new Date(),
          verifierId: user.userId,
          assignedVerifierId: null,
        },
        include: {
          reporter: { select: { id: true, name: true } },
          verifier: { select: { id: true, name: true } },
        },
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
            message: 'Verified. Allocate resources.',
          },
        });
      }

      await createAuditLog(
        {
          issueId: params.id,
          performedBy: user.userId,
          action: AUDIT_ACTIONS.USER_VERIFY_EXISTENCE,
          fromStatus: issue.status,
          toStatus: 'VERIFIED_BY_NEIGHBOR',
        },
        tx
      );

      return updated;
    });

    if (issue.reporterId) {
      await sendPushToUser(
        issue.reporterId,
        {
          title: 'Issue verified',
          body: `"${issue.title}" was verified by a neighbor. Admin will allocate resources.`,
          url: `/issues/${params.id}`,
          tag: `verified-${params.id}`,
        },
        { communityName: issue.communityName }
      );
    }

    return NextResponse.json({
      issue: result,
      message: 'Issue verified. Admin has been notified to allocate resources.',
    });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already verified this issue' }, { status: 400 });
    }
    console.error('Verify issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
