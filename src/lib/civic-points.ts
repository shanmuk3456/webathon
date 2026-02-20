/**
 * Atomic civic points application.
 * Points MUST be applied only inside a Prisma transaction.
 * Prevents double-application via transaction locking and previous-state checks.
 */
import { Prisma } from '@prisma/client';

export const POINTS = {
  APPROVE: 10,
  REJECT: -200,
  VERIFY: 5,
} as const;

export function assertPointsOnlyOnTransition(
  fromStatus: string,
  toStatus: string,
  pointsAwarded: boolean
): { points: number } | null {
  // +10 ONLY when PENDING_APPROVAL -> APPROVED and not already awarded
  if (fromStatus === 'PENDING_APPROVAL' && toStatus === 'APPROVED' && !pointsAwarded) {
    return { points: POINTS.APPROVE };
  }
  // -200 ONLY when PENDING_APPROVAL -> CLOSED (rejected)
  if (fromStatus === 'PENDING_APPROVAL' && toStatus === 'CLOSED') {
    return { points: POINTS.REJECT };
  }
  // +5 for verification (handled in verify routes, not status transition)
  return null;
}
