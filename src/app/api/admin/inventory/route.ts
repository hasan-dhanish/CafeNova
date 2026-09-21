import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateInventorySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  unit: z.string().min(1, 'Unit is required').max(20),
  currentStock: z.number().min(0),
  minStockThreshold: z.number().min(0),
  costPerUnit: z.number().min(0).default(0),
});

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const items = await prisma.inventoryItem.findMany({
      where: { cafeId: cafe.id },
      orderBy: { name: 'asc' },
    });

    const dtos = items.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      currentStock: i.currentStock,
      minStockThreshold: i.minStockThreshold,
      costPerUnit: i.costPerUnit,
      isLowStock: i.currentStock <= i.minStockThreshold,
      updatedAt: i.updatedAt.toISOString(),
    }));

    return apiSuccess(dtos);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return apiError('Unable to load inventory', 'INVENTORY_FETCH_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const body = await request.json();
    const parseResult = CreateInventorySchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid inventory payload', parseResult.error.flatten().fieldErrors);
    }

    const data = parseResult.data;

    const item = await prisma.inventoryItem.create({
      data: {
        cafeId: cafe.id,
        name: data.name,
        unit: data.unit,
        currentStock: data.currentStock,
        minStockThreshold: data.minStockThreshold,
        costPerUnit: data.costPerUnit,
      },
    });

    return apiSuccess(item, 201);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return apiError('Failed to create inventory item', 'INVENTORY_CREATE_ERROR', 500);
  }
}
