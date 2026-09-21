import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { createPaymentOrder } from '@/lib/payments';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreatePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreatePaymentSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid payment initiation payload');
    }

    const { orderId } = parseResult.data;

    // 1. Fetch order from DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { cafe: true },
    });

    if (!order) {
      return apiNotFound('Order not found');
    }

    if (order.paymentStatus === 'PAID') {
      return apiBadRequest('This order has already been paid.');
    }

    // 2. Create authoritative gateway order
    const gatewayOrder = await createPaymentOrder(order.id, order.total, order.cafe.currency);

    // 3. Upsert pending payment record in DB
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        amount: order.total,
        currency: order.cafe.currency,
        status: 'PENDING',
        transactionId: gatewayOrder.gatewayOrderId,
      },
      create: {
        orderId: order.id,
        amount: order.total,
        currency: order.cafe.currency,
        status: 'PENDING',
        transactionId: gatewayOrder.gatewayOrderId,
        provider: 'RAZORPAY',
      },
    });

    return apiSuccess({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: gatewayOrder.amount, // in paise
      amountInRupees: order.total,
      currency: gatewayOrder.currency,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      isMock: gatewayOrder.isMock,
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    return apiError('Failed to initiate payment', 'PAYMENT_INIT_ERROR', 500);
  }
}
