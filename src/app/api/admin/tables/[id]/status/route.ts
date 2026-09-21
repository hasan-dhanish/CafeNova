import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const TableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = TableStatusSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid table status', parseResult.error.flatten().fieldErrors);
    }

    const { status } = parseResult.data;

    const updated = await prisma.cafeTable.update({
      where: { id },
      data: { status },
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Error updating table status:', error);
    return apiError('Failed to update table status', 'TABLE_STATUS_ERROR', 500);
  }
}
