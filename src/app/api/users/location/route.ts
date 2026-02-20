import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware';
import { db } from '@/lib/db';
import { locationSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;

  try {
    const body = await request.json();
    const { latitude, longitude } = locationSchema.parse(body);

    await db.user.update({
      where: { id: user.userId },
      data: {
        lastLatitude: latitude,
        lastLongitude: longitude,
        lastLocationAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Update location error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

