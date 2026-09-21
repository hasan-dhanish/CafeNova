import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiUnauthorized, apiTooManyRequests } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';
import { setSessionCookie, AuthSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  // 1. Rate Limiting: max 5 login attempts per 2 minutes per IP
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(`login_${ip}`, 8, 120000);
  if (!allowed) {
    return apiTooManyRequests('Too many login attempts. Please wait 2 minutes.');
  }

  try {
    const body = await request.json();
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid credentials format', parseResult.error.flatten().fieldErrors);
    }

    const { email, password } = parseResult.data;

    // 2. Fetch user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { cafe: true },
    });

    // Constant time password check mitigation against user enumeration
    if (!user || !user.isActive) {
      // Dummy compare to mitigate timing attack
      await bcrypt.compare('dummy_password_for_timing', '$2a$10$abcdefghijklmnopqrstuvwxyz123456');
      return apiUnauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return apiUnauthorized('Invalid email or password');
    }

    // 3. Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 4. Build session
    const session: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'MANAGER' | 'STAFF',
      cafeId: user.cafeId,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const response = apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cafeName: user.cafe.name,
      },
    });

    return setSessionCookie(response, session);
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Unable to process login', 'LOGIN_ERROR', 500);
  }
}
