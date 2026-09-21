import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, apiBadRequest } from '@/lib/api-response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateProductSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name is required').max(100),
  description: z.string().min(5, 'Description is required').max(500),
  price: z.number().min(0, 'Price must be positive'),
  imageUrl: z.string().url().optional().nullable(),
  arModelUrl: z.string().optional().nullable(),
  isVegetarian: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  preparationTimeMin: z.number().int().min(1).max(60).default(10),
});

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const categories = await prisma.category.findMany({
      where: { cafeId: cafe.id },
      orderBy: { displayOrder: 'asc' },
      include: {
        products: {
          orderBy: { displayOrder: 'asc' },
          include: {
            customizationGroups: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return apiSuccess({ cafe, categories });
  } catch (error) {
    console.error('Error fetching admin menu products:', error);
    return apiError('Unable to load menu catalog', 'MENU_ADMIN_FETCH_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    const body = await request.json();
    const parseResult = CreateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return apiBadRequest('Invalid product payload', parseResult.error.flatten().fieldErrors);
    }

    const data = parseResult.data;

    // Verify category exists in cafe
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, cafeId: cafe.id },
    });
    if (!category) return apiBadRequest('Invalid category selected');

    const product = await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl || null,
        arModelUrl: data.arModelUrl || null,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        preparationTimeMin: data.preparationTimeMin,
        isAvailable: true,
      },
    });

    return apiSuccess(product, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return apiError('Failed to create product', 'PRODUCT_CREATE_ERROR', 500);
  }
}
