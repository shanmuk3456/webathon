import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { db } from '@/lib/db';
import { getLastResetTimestamp } from '@/lib/weekly-reset';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const [topUsers, lastReset] = await Promise.all([
      db.user.findMany({
        where: {
          communityName: user.communityName,
          role: 'USER',
        },
        select: {
          id: true,
          name: true,
          weeklyPoints: true,
        },
        orderBy: { weeklyPoints: 'desc' },
        take: 3,
      }),
      getLastResetTimestamp(),
    ]);

    const leaderboard = topUsers.map((u, index) => ({
      ...u,
      rank: index + 1,
    }));

    return NextResponse.json({
      leaderboard,
      lastResetTimestamp: lastReset?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
