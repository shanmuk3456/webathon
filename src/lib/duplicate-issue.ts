/**
 * Duplicate issue detection and merging.
<<<<<<< HEAD
 * Before creating: if existing issue within radius AND similar title/description -> increment supportCount, return existing.
 * If within radius but NOT similar (different problems) -> create new issue.
=======
 * Before creating: if existing issue within radius -> increment supportCount, return existing.
>>>>>>> 017bcdc (deploy)
 */
import { db } from '@/lib/db';
import { calculateDistance } from '@/lib/utils';

const DUPLICATE_RADIUS_METERS = Number(process.env.DUPLICATE_RADIUS_METERS) || 50;
<<<<<<< HEAD
const MIN_WORDS_IN_COMMON = 2; // Require at least 2 meaningful words to overlap
const MIN_WORD_LENGTH = 3; // Ignore very short words (a, an, on, in, etc.)

function getMeaningfulWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= MIN_WORD_LENGTH)
  );
}

function areSimilarIssues(titleA: string, titleB: string, descA: string, descB: string): boolean {
  const wordsA = getMeaningfulWords(`${titleA} ${descA}`);
  const wordsB = getMeaningfulWords(`${titleB} ${descB}`);
  const overlap = [...wordsA].filter((w) => wordsB.has(w)).length;
  return overlap >= MIN_WORDS_IN_COMMON;
}
=======
>>>>>>> 017bcdc (deploy)

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
<<<<<<< HEAD
    select: { id: true, latitude: true, longitude: true, title: true, description: true, supportCount: true },
=======
    select: { id: true, latitude: true, longitude: true, title: true, supportCount: true },
>>>>>>> 017bcdc (deploy)
  });

  for (const e of existing) {
    const dist = calculateDistance(params.latitude, params.longitude, e.latitude, e.longitude);
<<<<<<< HEAD
    const similar = areSimilarIssues(
      params.title,
      e.title,
      params.description,
      e.description ?? ''
    );
    if (dist <= DUPLICATE_RADIUS_METERS && similar) {
=======
    if (dist <= DUPLICATE_RADIUS_METERS) {
>>>>>>> 017bcdc (deploy)
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
