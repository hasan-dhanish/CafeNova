import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const AdjustStockSchema = z.object({
  adjustment: z.number(), // positive or negative amount to add/subtract
  newStock: z.number().optional(), // or directly set new stock level
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = AdjustStockSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid stock adjustment');
    }

    const { adjustment, newStock } = parseResult.data;

    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiNotFound('Inventory item not found');
    }

    let calculatedStock = existing.currentStock;
    if (newStock !== undefined) {
      calculatedStock = Math.max(0, newStock);
    } else if (adjustment !== undefined) {
      calculatedStock = Math.max(0, existing.currentStock + adjustment);
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        currentStock: calculatedStock,
      },
    });

    return apiSuccess({
      id: updated.id,
      name: updated.name,
      currentStock: updated.currentStock,
      isLowStock: updated.currentStock <= updated.minStockThreshold,
    });
  } catch (error) {
    console.error('Error adjusting inventory stock:', error);
    return apiError('Failed to adjust stock', 'STOCK_ADJUST_ERROR', 500);
  }
}
