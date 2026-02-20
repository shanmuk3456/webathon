/**
 * Re-exports for backward compatibility.
 * Prefer using lib/api-auth for new code.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, requireCommunityMatch } from './api-auth';
import { JWTPayload, Role } from '@/types';

export type AuthenticatedRequest = NextRequest & { user?: JWTPayload };

export const authenticateRequest = requireAuth;

export function requireRole(roles: Role[]) {
  return (user: JWTPayload) => roles.includes(user.role);
}

export function requireCommunity(userCommunityName: string, targetCommunityName: string): boolean {
  return userCommunityName === targetCommunityName;
}

export { requireAdmin };
