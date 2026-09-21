import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiBadRequest, apiError } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const AnalyticsEventSchema = z.object({
  eventType: z.enum(['AR_VIEW', 'AR_INTERACT', 'CART_ADD', 'ORDER_SUCCESS']),
  productId: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export async function POST(request: NextRequest) {
  // Rate limiting telemetry: max 60 events per min per IP
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(`telemetry_${ip}`, 60, 60000);
  if (!allowed) {
    return apiSuccess({ ignored: true }); // Gracefully ignore excess telemetry
  }

  try {
    const body = await request.json();
    const parseResult = AnalyticsEventSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid event format');
    }

    const { eventType, productId, metadata } = parseResult.data;

    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const event = await prisma.analyticsEvent.create({
      data: {
        cafeId: cafe.id,
        eventType,
        productId: productId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return apiSuccess({ logged: true, eventId: event.id });
  } catch (error) {
    console.error('Analytics event log error:', error);
    return apiError('Failed to record analytics event', 'EVENT_LOG_ERROR', 500);
  }
}
