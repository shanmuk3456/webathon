/**
 * Centralized API authentication and authorization middleware.
 * STRICT ROLE & COMMUNITY ISOLATION - Never trust frontend-provided community_name.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './auth';
import { db } from '@/lib/db';
import { JWTPayload, Role } from '@/types';

export type AuthResult = { user: JWTPayload } | NextResponse;

/** Require valid JWT. Returns { user } or 401 NextResponse. */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = verifyToken(token);
    return { user };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

/** Require ADMIN role. Returns 403 if not admin. Call after requireAuth. */
export function requireAdmin(user: JWTPayload): boolean {
  return user.role === 'ADMIN';
}

/** Require USER role. Returns 403 if not user. Call after requireAuth. */
export function requireUser(user: JWTPayload): boolean {
  return user.role === 'USER';
}

/** Require issue belongs to user's community. Fetches issue from DB - never trust request. */
export async function requireCommunityMatch(
  issueId: string,
  userCommunityName: string
<<<<<<< HEAD
): Promise<{ ok: true; issue: NonNullable<Awaited<ReturnType<typeof db.issue.findFirst>>> } | NextResponse> {
=======
): Promise<{ ok: true; issue: Awaited<ReturnType<typeof db.issue.findFirst>> } | NextResponse> {
>>>>>>> 017bcdc (deploy)
  const issue = await db.issue.findFirst({
    where: { id: issueId },
  });

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  if (issue.communityName !== userCommunityName) {
    return NextResponse.json({ error: 'Forbidden: issue does not belong to your community' }, { status: 403 });
  }

  return { ok: true as const, issue };
}

/** Combined: require auth + admin + community match for an issue. */
export async function requireAdminIssueAccess(
  request: NextRequest,
  issueId: string
): Promise<
  | { user: JWTPayload; issue: NonNullable<Awaited<ReturnType<typeof db.issue.findFirst>>> }
  | NextResponse
> {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  if (!requireAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const communityResult = await requireCommunityMatch(issueId, user.communityName);
  if (communityResult instanceof NextResponse) return communityResult;
  return { user, issue: communityResult.issue };
}

/** Combined: require auth + community match for an issue (any role). */
export async function requireIssueAccess(
  request: NextRequest,
  issueId: string
): Promise<
  | { user: JWTPayload; issue: NonNullable<Awaited<ReturnType<typeof db.issue.findFirst>>> }
  | NextResponse
> {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const communityResult = await requireCommunityMatch(issueId, user.communityName);
  if (communityResult instanceof NextResponse) return communityResult;
  return { user, issue: communityResult.issue };
}
