import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth-token';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE;
}
