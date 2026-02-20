import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const [
      totalIssues,
      pendingIssues,
      approvedIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      totalUsers,
      totalCivicPoints,
      recentIssues,
    ] = await Promise.all([
      db.issue.count({
        where: { communityName: user.communityName },
      }),
      db.issue.count({
        where: { communityName: user.communityName, status: 'PENDING_APPROVAL' },
      }),
      db.issue.count({
        where: { communityName: user.communityName, status: 'APPROVED' },
      }),
      db.issue.count({
        where: { communityName: user.communityName, status: 'IN_PROGRESS' },
      }),
      db.issue.count({
        where: { communityName: user.communityName, status: 'RESOLVED' },
      }),
      db.issue.count({
        where: { communityName: user.communityName, status: 'CLOSED' },
      }),
      db.user.count({
        where: { communityName: user.communityName, role: 'USER' },
      }),
      db.user.aggregate({
        where: { communityName: user.communityName, role: 'USER' },
        _sum: { civicPoints: true },
      }),
      db.issue.findMany({
        where: { communityName: user.communityName },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const avgCivicPoints = totalUsers > 0 ? Math.round((totalCivicPoints._sum.civicPoints || 0) / totalUsers) : 0;
    const resolutionRate = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalIssues,
        pendingIssues,
        approvedIssues,
        inProgressIssues,
        resolvedIssues,
        closedIssues,
        totalUsers,
        totalCivicPoints: totalCivicPoints._sum.civicPoints || 0,
        avgCivicPoints,
        resolutionRate,
      },
      recentIssues,
    });
  } catch (error) {
    console.error('Get community stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
