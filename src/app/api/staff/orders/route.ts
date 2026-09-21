import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'active' (default) or 'all'

    const whereClause: any = {};
    if (filter === 'active' || !filter) {
      whereClause.status = {
        in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'],
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc', // oldest first for kitchen priority
      },
      include: {
        table: {
          select: {
            tableNumber: true,
          },
        },
        items: {
          include: {
            customizations: true,
            product: {
              select: {
                preparationTimeMin: true,
              },
            },
          },
        },
      },
    });

    const dtos = orders.map((order) => {
      const maxPrepTime = Math.max(
        ...order.items.map((i) => i.product?.preparationTimeMin || 10),
        5
      );

      return {
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
    });

    return apiSuccess(dtos);
  } catch (error) {
    console.error('Error fetching staff orders:', error);
    return apiError('Unable to load orders', 'STAFF_ORDERS_ERROR', 500);
  }
}
