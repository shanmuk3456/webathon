import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, requireCommunityMatch } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { updateIssueSchema } from '@/lib/validations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const communityResult = await requireCommunityMatch(params.id, user.communityName);
  if (communityResult instanceof NextResponse) return communityResult;

  try {
    const issue = await db.issue.findFirst({
      where: { id: params.id, communityName: user.communityName },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        verifier: { select: { id: true, name: true } },
        admin: { select: { id: true, name: true } },
        verifications: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error) {
    console.error('Get issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const access = await requireAuth(request);
  if (access instanceof NextResponse) return access;
  const { user } = access;

  if (!requireAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const communityResult = await requireCommunityMatch(params.id, user.communityName);
  if (communityResult instanceof NextResponse) return communityResult;

  try {
    const body = await request.json();
    const validatedData = updateIssueSchema.parse(body);

    const issue = await db.issue.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ issue });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    console.error('Update issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
