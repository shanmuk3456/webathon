import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { generateToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/auth-cookie';
import type { Role } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // For admin role, validate community_name
    if (validatedData.role === 'ADMIN') {
      // Check if admin already exists for this community
      const existingAdmin = await db.user.findFirst({
        where: {
          communityName: validatedData.communityName,
          role: 'ADMIN',
        },
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: 'An admin already exists for this community' },
          { status: 400 }
        );
      }
    }

    // Hash password (bcrypt)
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // House address required for USER, optional for ADMIN
    const houseAddress =
      validatedData.role === 'USER'
        ? validatedData.houseAddress!.trim()
        : validatedData.houseAddress?.trim() ?? null;

    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        houseAddress,
        communityName: validatedData.communityName,
        role: validatedData.role,
      },
    });

    // Create admin profile if role is ADMIN
    if (user.role === 'ADMIN') {
      await db.admin.create({
        data: {
          userId: user.id,
          communityName: user.communityName,
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      communityName: user.communityName,
    });

    const response = NextResponse.json(
      {
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
      },
      { status: 201 }
    );
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
