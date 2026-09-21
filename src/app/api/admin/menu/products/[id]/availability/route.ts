import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiNotFound } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const AvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parseResult = AvailabilitySchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid availability value');
    }

    const { isAvailable } = parseResult.data;

    const updated = await prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    return apiSuccess({
      id: updated.id,
      name: updated.name,
      isAvailable: updated.isAvailable,
    });
  } catch (error) {
    console.error('Error toggling product availability:', error);
    return apiError('Failed to update availability', 'PRODUCT_AVAILABILITY_ERROR', 500);
  }
}
