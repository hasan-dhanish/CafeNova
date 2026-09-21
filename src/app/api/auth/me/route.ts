import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return apiUnauthorized('Not authenticated');
  }

  return apiSuccess({
    user: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      cafeId: session.cafeId,
    },
  });
}
