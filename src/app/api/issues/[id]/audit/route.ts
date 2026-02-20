import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireAdmin } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!requireAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const issue = await db.issue.findFirst({
      where: {
        id: params.id,
        communityName: user.communityName,
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const logs = await db.issueAuditLog.findMany({
      where: { issueId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ auditLogs: logs });
  } catch (error) {
    console.error('Get audit log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
