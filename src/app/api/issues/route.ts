import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireUser } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { createIssueSchema } from '@/lib/validations';
import { IssueStatus } from '@/types';
import { findOrCreateIssue } from '@/lib/duplicate-issue';
import { checkIssueRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as IssueStatus | null;

    const where: { communityName: string; status?: IssueStatus } = {
      communityName: user.communityName,
    };
    if (status) where.status = status;

    const issues = await db.issue.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        verifier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Get issues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  if (!requireUser(user)) {
    return NextResponse.json(
      { error: 'Only community members (USER role) can submit issues' },
      { status: 403 }
    );
  }

  const rateLimit = await checkIssueRateLimit(user.userId);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: rateLimit.error }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validatedData = createIssueSchema.parse(body);

    const imageUrl =
      validatedData.image_url && validatedData.image_url.trim() !== ''
        ? validatedData.image_url.trim()
        : null;

    const { created, issue } = await findOrCreateIssue({
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      communityName: user.communityName,
      title: validatedData.title.trim(),
      description: validatedData.description.trim(),
      imageUrl,
      urgency: validatedData.urgency,
      reporterId: user.userId,
    });

    return NextResponse.json(
      {
        issue,
        message: created
          ? 'Issue created.'
          : 'Similar issue exists nearby. Support count incremented.',
      },
      { status: created ? 201 : 200 }
    );
  } catch (error: unknown) {
<<<<<<< HEAD
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      const zodError = error as unknown as { errors: unknown };
      return NextResponse.json({ error: 'Validation error', details: zodError.errors }, { status: 400 });
=======
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: (error as { errors: unknown }).errors }, { status: 400 });
>>>>>>> 017bcdc (deploy)
    }
    console.error('Create issue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
