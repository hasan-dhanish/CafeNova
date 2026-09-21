import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();

    const parseResult = UpdateStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid status value', parseResult.error.flatten().fieldErrors);
    }

    const { status: newStatus } = parseResult.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { table: true },
    });

    if (!existingOrder) {
      return apiNotFound('Order not found');
    }

    // Update order status in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
        },
      });

      // If order is completed or cancelled, check if table should be set to AVAILABLE
      if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
        const remainingActiveOrders = await tx.order.count({
          where: {
            tableId: existingOrder.tableId,
            id: { not: orderId },
            status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
          },
        });

        if (remainingActiveOrders === 0) {
          await tx.cafeTable.update({
            where: { id: existingOrder.tableId },
            data: { status: 'AVAILABLE' },
          });
        }
      }

      return order;
    });

    return apiSuccess({
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return apiError('Failed to update order status', 'ORDER_STATUS_UPDATE_ERROR', 500);
  }
}
