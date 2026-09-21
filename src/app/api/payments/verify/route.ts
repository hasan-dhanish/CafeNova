import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { verifyPaymentSignature } from '@/lib/payments';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const VerifyPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  gatewayOrderId: z.string().min(1, 'Gateway Order ID is required'),
  gatewayPaymentId: z.string().min(1, 'Gateway Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  paymentMethod: z.string().default('UPI'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = VerifyPaymentSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid payment verification data', parseResult.error.flatten().fieldErrors);
    }

    const { orderId, gatewayOrderId, gatewayPaymentId, signature, paymentMethod } =
      parseResult.data;

    // 1. Authoritative Signature Verification (HMAC SHA-256)
    const isValid = verifyPaymentSignature(gatewayOrderId, gatewayPaymentId, signature);

    if (!isValid) {
      // Record payment failure in database
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: 'FAILED',
          transactionId: gatewayPaymentId,
        },
      });

      return apiBadRequest('Payment verification failed. Invalid cryptographic signature.');
    }

    // 2. Fetch order and verify existence
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return apiNotFound('Order not found');
    }

    // Idempotency: If already marked as paid, return success without duplicate writes
    if (order.paymentStatus === 'PAID') {
      return apiSuccess({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: 'PAID',
        verified: true,
        alreadyProcessed: true,
      });
    }

    // 3. Atomic database update marking order as PAID
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Upsert payment record
      await tx.payment.upsert({
        where: { orderId },
        update: {
          transactionId: gatewayPaymentId,
          status: 'SUCCESS',
          paymentMethod,
          rawResponse: JSON.stringify({
            gatewayOrderId,
            gatewayPaymentId,
            verifiedAt: new Date().toISOString(),
          }),
        },
        create: {
          orderId,
          transactionId: gatewayPaymentId,
          amount: order.total,
          currency: 'INR',
          status: 'SUCCESS',
          paymentMethod,
        },
      });

      // Update order payment status
      return await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          // Advance from PENDING to CONFIRMED if awaiting kitchen
          status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
        },
      });
    });

    return apiSuccess({
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      verified: true,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return apiError('Server error during payment verification', 'VERIFY_ERROR', 500);
  }
}
