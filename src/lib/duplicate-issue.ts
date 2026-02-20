/**
 * Duplicate issue detection and merging.
 * Before creating: if existing issue within radius -> increment supportCount, return existing.
 */
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils';

const DUPLICATE_RADIUS_METERS = Number(process.env.DUPLICATE_RADIUS_METERS) || 50;

export async function findOrCreateIssue(params: {
  latitude: number;
  longitude: number;
  communityName: string;
  title: string;
  description: string;
  imageUrl: string | null;
  urgency: string;
  reporterId: string;
}): Promise<{ created: boolean; issue: Awaited<ReturnType<typeof db.issue.findFirst>> }> {
  const existing = await db.issue.findMany({
    where: {
      communityName: params.communityName,
      status: { notIn: ['CLOSED'] },
    },
    select: { id: true, latitude: true, longitude: true, title: true, supportCount: true },
  });

  for (const e of existing) {
    const dist = calculateDistance(params.latitude, params.longitude, e.latitude, e.longitude);
    if (dist <= DUPLICATE_RADIUS_METERS) {
      const updated = await db.issue.update({
        where: { id: e.id },
        data: { supportCount: { increment: 1 } },
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
      });
      return { created: false, issue: updated };
    }
  }

  const created = await db.issue.create({
    data: {
      title: params.title,
      description: params.description,
      imageUrl: params.imageUrl,
      latitude: params.latitude,
      longitude: params.longitude,
      urgency: params.urgency,
      status: 'PENDING_APPROVAL',
      communityName: params.communityName,
      reporterId: params.reporterId,
    },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  });
  return { created: true, issue: created };
}
