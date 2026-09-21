import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest } from '@/lib/api-response';
import { getRecommendationsForProduct } from '@/lib/recommendations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return apiBadRequest('productId query parameter is required');
    }

    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const result = await getRecommendationsForProduct(productId, cafe.id);

    return apiSuccess({
      source: result.source,
      label:
        result.source === 'basket_history'
          ? 'Frequently Purchased Together'
          : 'Chef Curated Pairings',
      recommendations: result.items,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return apiError('Unable to load recommendations', 'REC_ERROR', 500);
  }
}
