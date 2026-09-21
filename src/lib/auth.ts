import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE_NAME = 'cafenova_session';
const SECRET = process.env.SESSION_SECRET || 'cafenova_dev_secret_key_at_least_32_chars_long_12345';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  cafeId: string;
  expiresAt: number;
}

/**
 * Creates a cryptographically signed token string
 */
export function signToken(payload: object): string {
  const json = JSON.stringify(payload);
  const base64Payload = Buffer.from(json).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(base64Payload).digest('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and parses a signed token string
 */
export function verifyToken<T>(token: string): T | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(base64Payload)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const json = Buffer.from(base64Payload, 'base64url').toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Sets an HttpOnly, SameSite, Secure cookie for authenticated sessions
 */
export function setSessionCookie(response: NextResponse, session: AuthSession) {
  const token = signToken(session);
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  return response;
}

/**
 * Clears the session cookie
 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

/**
 * Extracts and verifies the current session from request cookies
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifyToken<AuthSession>(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    return null;
  }

  return session;
}

/**
 * Server-side authorization check for API routes
 */
export async function requireAuth(allowedRoles?: ('ADMIN' | 'MANAGER' | 'STAFF')[]) {
  const session = await getSession();
  if (!session) {
    return { authorized: false as const, error: 'Unauthorized', status: 401 };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { authorized: false as const, error: 'Forbidden: Insufficient privileges', status: 403 };
  }

  return { authorized: true as const, session };
}
