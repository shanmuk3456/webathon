import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { generateToken } from '@/lib/auth';
<<<<<<< HEAD
import type { Role } from '@/types';
=======
>>>>>>> 017bcdc (deploy)
import { setAuthCookie } from '@/lib/auth-cookie';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Community name required for both: must match user's community
    if (validatedData.communityName.trim().toLowerCase() !== user.communityName.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid email, password, or community name' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
<<<<<<< HEAD
      role: user.role as Role,
=======
      role: user.role,
>>>>>>> 017bcdc (deploy)
      communityName: user.communityName,
    });

    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        communityName: user.communityName,
        civicPoints: user.civicPoints,
        weeklyPoints: user.weeklyPoints,
      },
    });
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
