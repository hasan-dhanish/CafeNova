import { NextResponse } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = apiSuccess({ message: 'Logged out successfully' });
  return clearSessionCookie(response);
}
