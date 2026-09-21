import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  apiSuccess,
  apiError,
  apiBadRequest,
  apiNotFound,
  apiTooManyRequests,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 per item'),
  optionIds: z.array(z.string()).default([]),
});

const CreateOrderSchema = z.object({
  tableId: z.string().min(1, 'Table ID is required'),
  customerNotes: z.string().max(300, 'Notes cannot exceed 300 characters').optional().nullable(),
  customerPhone: z.string().max(20).optional().nullable(),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least 1 item').max(30, 'Maximum 30 items per order'),
});

export async function POST(request: NextRequest) {
  // 1. Rate Limiting: max 10 orders per 5 minutes per IP
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(`order_${ip}`, 10, 300000);
  if (!allowed) {
    return apiTooManyRequests('Too many order requests. Please wait a moment.');
  }

  try {
    const body = await request.json();
    const parseResult = CreateOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return apiBadRequest('Invalid order payload', parseResult.error.flatten().fieldErrors);
    }

    const { tableId, customerNotes, customerPhone, items } = parseResult.data;

    // 2. Validate Table and Cafe
    const table = await prisma.cafeTable.findUnique({
      where: { id: tableId },
      include: { cafe: true },
    });

    if (!table) {
      return apiNotFound('Table not found or invalid');
    }

    if (!table.cafe.isActive) {
      return apiBadRequest('This café is currently not accepting orders');
    }

    // 3. Fetch all requested products and their options from DB (SERVER-AUTHORITATIVE)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        cafeId: table.cafeId,
        isAvailable: true,
      },
      include: {
        customizationGroups: {
          include: {
            options: true,
          },
        },
      },
    });

    if (dbProducts.length !== new Set(productIds).size) {
      return apiBadRequest('One or more items are currently unavailable or invalid');
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 4. Calculate Server-Side Subtotal, Items, and Modifiers
    let subtotal = 0;
    const preparedOrderItems: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      customizationsTotal: number;
      itemTotal: number;
      customizations: {
        groupName: string;
        optionName: string;
        priceModifier: number;
      }[];
    }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      let customizationsTotal = 0;
      const appliedCustomizations: {
        groupName: string;
        optionName: string;
        priceModifier: number;
      }[] = [];

      // Validate options if provided
      if (item.optionIds && item.optionIds.length > 0) {
        for (const group of product.customizationGroups) {
          const matchedOptions = group.options.filter(
            (opt) => item.optionIds.includes(opt.id) && opt.isAvailable
          );

          // Validate max selection constraint
          if (matchedOptions.length > group.maxSelect) {
            return apiBadRequest(
              `Exceeded maximum options limit for ${group.name} on ${product.name}`
            );
          }

          for (const opt of matchedOptions) {
            customizationsTotal += opt.priceModifier;
            appliedCustomizations.push({
              groupName: group.name,
              optionName: opt.name,
              priceModifier: opt.priceModifier,
            });
          }
        }
      }

      const itemUnitPrice = product.price;
      const singleItemFinalPrice = itemUnitPrice + customizationsTotal;
      const lineItemTotal = singleItemFinalPrice * item.quantity;

      subtotal += lineItemTotal;

      preparedOrderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: itemUnitPrice,
        customizationsTotal,
        itemTotal: lineItemTotal,
        customizations: appliedCustomizations,
      });
    }

    // 5. Calculate Tax and Total
    const taxRate = table.cafe.taxRate; // e.g. 5%
    const tax = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    // 6. Generate sequential human-readable Order Number
    const countToday = await prisma.order.count({
      where: {
        cafeId: table.cafeId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const orderNumber = `CN-${String(countToday + 101).padStart(4, '0')}`;

    // 7. Atomic Transaction in Database
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          cafeId: table.cafeId,
          tableId: table.id,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          subtotal,
          tax,
          total,
          customerNotes: customerNotes ? customerNotes.trim() : null,
          customerPhone: customerPhone ? customerPhone.trim() : null,
          items: {
            create: preparedOrderItems.map((pi) => ({
              productId: pi.productId,
              productName: pi.productName,
              quantity: pi.quantity,
              unitPrice: pi.unitPrice,
              customizationsTotal: pi.customizationsTotal,
              itemTotal: pi.itemTotal,
              customizations: {
                create: pi.customizations.map((c) => ({
                  groupName: c.groupName,
                  optionName: c.optionName,
                  priceModifier: c.priceModifier,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              customizations: true,
            },
          },
          table: true,
        },
      });

      // Update table status to OCCUPIED if it was AVAILABLE
      if (table.status === 'AVAILABLE') {
        await tx.cafeTable.update({
          where: { id: table.id },
          data: { status: 'OCCUPIED' },
        });
      }

      return order;
    });

    return apiSuccess(
      {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.status,
        paymentStatus: createdOrder.paymentStatus,
        subtotal: createdOrder.subtotal,
        tax: createdOrder.tax,
        total: createdOrder.total,
        tableNumber: createdOrder.table.tableNumber,
        createdAt: createdOrder.createdAt.toISOString(),
      },
      201
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return apiError('Unable to create order. Please try again.', 'ORDER_CREATION_FAILED', 500);
  }
}
