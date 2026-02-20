import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

