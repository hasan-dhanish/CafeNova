import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CounterSettleSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(['CASH', 'CARD_COUNTER', 'UPI_COUNTER']).default('CASH'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CounterSettleSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid payload');
    }

    const { orderId, method } = parseResult.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return apiNotFound('Order not found');
    }

    const txId = `counter_${method.toLowerCase()}_${Date.now()}`;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.upsert({
        where: { orderId },
        update: {
          provider: 'COUNTER',
          paymentMethod: method,
          status: 'SUCCESS',
          transactionId: txId,
        },
        create: {
          orderId,
          provider: 'COUNTER',
          paymentMethod: method,
          amount: order.total,
          currency: 'INR',
          status: 'SUCCESS',
          transactionId: txId,
        },
      });

      return await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
        },
      });
    });

    return apiSuccess({
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      paymentStatus: updated.paymentStatus,
    });
  } catch (error) {
    console.error('Counter settle error:', error);
    return apiError('Failed to record counter settlement', 'COUNTER_SETTLE_ERROR', 500);
  }
}
