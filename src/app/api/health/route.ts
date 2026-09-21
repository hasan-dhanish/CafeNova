import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ping database with a lightweight query
    const cafeCount = await prisma.cafe.count();

    return apiSuccess({
      status: 'healthy',
      service: 'cafenova-core',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        cafesRegistered: cafeCount,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return apiError(
      'Service database connection failed',
      'SERVICE_UNHEALTHY',
      503
    );
  }
}
