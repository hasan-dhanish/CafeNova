import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateTableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required').max(10),
  capacity: z.number().int().min(1).max(20).default(4),
});

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const tables = await prisma.cafeTable.findMany({
      where: { cafeId: cafe.id },
      orderBy: { tableNumber: 'asc' },
      include: {
        orders: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
          },
        },
      },
    });

    const dtos = tables.map((t) => ({
      id: t.id,
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      status: t.status,
      activeOrderCount: t.orders.length,
      activeOrders: t.orders,
      qrSecretToken: t.qrSecretToken,
    }));

    return apiSuccess(dtos);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return apiError('Unable to load tables', 'TABLE_FETCH_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const body = await request.json();
    const parseResult = CreateTableSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid table data', parseResult.error.flatten().fieldErrors);
    }

    const { tableNumber, capacity } = parseResult.data;

    // Check duplicate
    const existing = await prisma.cafeTable.findFirst({
      where: { cafeId: cafe.id, tableNumber },
    });
    if (existing) {
      return apiBadRequest(`Table ${tableNumber} already exists.`);
    }

    const qrSecretToken = `tok_${tableNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.random().toString(36).substring(2, 10)}`;

    const newTable = await prisma.cafeTable.create({
      data: {
        cafeId: cafe.id,
        tableNumber,
        capacity,
        qrSecretToken,
        status: 'AVAILABLE',
      },
    });

    return apiSuccess(newTable, 201);
  } catch (error) {
    console.error('Error creating table:', error);
    return apiError('Failed to create table', 'TABLE_CREATE_ERROR', 500);
  }
}
