/**
 * Rate limiting: backend-only enforcement.
 * - Max 5 issues per user per 24 hours.
 * - Max 20 verifications per user per 24 hours.
 */
import { db } from '@/lib/db';

const MAX_ISSUES_PER_24H = 5;
const MAX_VERIFICATIONS_PER_24H = 20;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function checkIssueRateLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await db.issue.count({
    where: {
      reporterId: userId,
      createdAt: { gte: since },
    },
  });

  if (count >= MAX_ISSUES_PER_24H) {
    return {
      allowed: false,
      error: `Rate limit exceeded: maximum ${MAX_ISSUES_PER_24H} issues per 24 hours. Try again later.`,
    };
  }
  return { allowed: true };
}

export async function checkVerificationRateLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await db.verification.count({
    where: {
      userId,
      createdAt: { gte: since },
    },
  });

  if (count >= MAX_VERIFICATIONS_PER_24H) {
    return {
      allowed: false,
      error: `Rate limit exceeded: maximum ${MAX_VERIFICATIONS_PER_24H} verifications per 24 hours. Try again later.`,
    };
  }
  return { allowed: true };
}
