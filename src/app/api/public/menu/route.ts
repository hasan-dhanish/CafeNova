import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest, apiTooManyRequests } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Rate limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(`menu_${ip}`, 120, 60000);
  if (!allowed) {
    return apiTooManyRequests();
  }

  try {
    const { searchParams } = new URL(request.url);
    const tableNumber = searchParams.get('table');

    // 2. Fetch default active café
    const cafe = await prisma.cafe.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        currency: true,
        taxRate: true,
      },
    });

    if (!cafe) {
      return apiError('No active café found', 'CAFE_NOT_FOUND', 404);
    }

    // 3. Resolve table if tableNumber provided
    let tableInfo = null;
    if (tableNumber) {
      const table = await prisma.cafeTable.findFirst({
        where: {
          cafeId: cafe.id,
          tableNumber: {
            equals: tableNumber,
          },
        },
        select: {
          id: true,
          tableNumber: true,
          capacity: true,
          status: true,
        },
      });

      if (table) {
        tableInfo = table;
      }
    }

    // 4. Fetch active categories and available products
    const categories = await prisma.category.findMany({
      where: {
        cafeId: cafe.id,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        products: {
          where: {
            isAvailable: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
          select: {
            id: true,
            categoryId: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            arModelUrl: true,
            isAvailable: true,
            isVegetarian: true,
            isVegan: true,
            isGlutenFree: true,
            preparationTimeMin: true,
            customizationGroups: {
              select: {
                id: true,
                name: true,
                minSelect: true,
                maxSelect: true,
                isRequired: true,
                options: {
                  where: {
                    isAvailable: true,
                  },
                  select: {
                    id: true,
                    name: true,
                    priceModifier: true,
                    isDefault: true,
                    isAvailable: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return apiSuccess({
      cafe,
      table: tableInfo,
      categories,
    });
  } catch (error) {
    console.error('Error fetching public menu:', error);
    return apiError('Unable to load menu catalog', 'MENU_FETCH_ERROR', 500);
  }
}
