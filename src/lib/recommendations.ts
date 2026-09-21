import { prisma } from './prisma';

export interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  reason: 'Frequently Ordered Together' | 'Chef Curated Pairing';
}

/**
 * Computes recommendations based on actual basket co-occurrence and deterministic pairings
 */
export async function getRecommendationsForProduct(
  productId: string,
  cafeId: string,
  limit = 3
): Promise<{ source: 'basket_history' | 'rule_based'; items: RecommendedProduct[] }> {
  // 1. Check actual historical co-occurrence in orders
  const ordersWithProduct = await prisma.order.findMany({
    where: {
      cafeId,
      status: { not: 'CANCELLED' },
      items: {
        some: { productId },
      },
    },
    select: {
      items: {
        select: {
          productId: true,
        },
      },
    },
    take: 50,
  });

  const coOccurrenceCounts: Record<string, number> = {};
  ordersWithProduct.forEach((order) => {
    order.items.forEach((item) => {
      if (item.productId !== productId) {
        coOccurrenceCounts[item.productId] = (coOccurrenceCounts[item.productId] || 0) + 1;
      }
    });
  });

  const sortedProductIds = Object.entries(coOccurrenceCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id);

  if (sortedProductIds.length >= 2) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: sortedProductIds.slice(0, limit) },
        isAvailable: true,
      },
      include: { category: true },
    });

    return {
      source: 'basket_history',
      items: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        categoryName: p.category.name,
        reason: 'Frequently Ordered Together',
      })),
    };
  }

  // 2. Rule-based complementary pairings based on category
  const targetProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!targetProduct) {
    return { source: 'rule_based', items: [] };
  }

  let targetCategorySlug: string;
  if (targetProduct.category.slug === 'specialty-coffee') {
    targetCategorySlug = 'artisan-bakery'; // Coffee pairs with bakery
  } else if (targetProduct.category.slug === 'sourdough-sandwiches') {
    targetCategorySlug = 'cold-brews-iced'; // Sandwiches pair with cold drinks
  } else if (targetProduct.category.slug === 'artisan-bakery') {
    targetCategorySlug = 'specialty-coffee'; // Bakery pairs with hot coffee
  } else {
    targetCategorySlug = 'specialty-coffee';
  }

  const complementaryProducts = await prisma.product.findMany({
    where: {
      cafeId,
      isAvailable: true,
      category: { slug: targetCategorySlug },
      id: { not: productId },
    },
    include: { category: true },
    take: limit,
  });

  return {
    source: 'rule_based',
    items: complementaryProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
      categoryName: p.category.name,
      reason: 'Chef Curated Pairing',
    })),
  };
}
