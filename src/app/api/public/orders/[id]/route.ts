import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiNotFound, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            tableNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                preparationTimeMin: true,
              },
            },
            customizations: true,
          },
        },
      },
    });

    if (!order) {
      return apiNotFound('Order not found');
    }

    // Determine estimated prep time as maximum of item preparation times
    const maxPrepTime = Math.max(
      ...order.items.map((i) => i.product?.preparationTimeMin || 10),
      5
    );

    const dto = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      customerNotes: order.customerNotes,
      createdAt: order.createdAt.toISOString(),
      tableNumber: order.table.tableNumber,
      estimatedTimeMin: maxPrepTime,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        itemTotal: item.itemTotal,
        customizations: item.customizations.map((c) => ({
          groupName: c.groupName,
          optionName: c.optionName,
          priceModifier: c.priceModifier,
        })),
      })),
    };

    return apiSuccess(dto);
  } catch (error) {
    console.error('Error fetching order status:', error);
    return apiError('Unable to fetch order status', 'ORDER_FETCH_FAILED', 500);
  }
}
