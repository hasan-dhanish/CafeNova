import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst({ where: { isActive: true } });
    if (!cafe) return apiError('Café not found', 'CAFE_NOT_FOUND', 404);

    // 1. All Orders for this cafe
    const allOrders = await prisma.order.findMany({
      where: { cafeId: cafe.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const nonCancelledOrders = allOrders.filter((o) => o.status !== 'CANCELLED');
    const totalOrdersCount = allOrders.length;
    const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = nonCancelledOrders.length > 0 ? totalRevenue / nonCancelledOrders.length : 0;

    // 2. Orders by Status
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      SERVED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    allOrders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status] += 1;
      }
    });

    // 3. Top Selling Products & Category Performance
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    const categorySalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    nonCancelledOrders.forEach((order) => {
      order.items.forEach((item) => {
        // Product metrics
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.itemTotal;

        // Category metrics
        const catName = item.product?.category?.name || 'General';
        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = {
            name: catName,
            quantity: 0,
            revenue: 0,
          };
        }
        categorySalesMap[catName].quantity += item.quantity;
        categorySalesMap[catName].revenue += item.itemTotal;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const categoryPerformance = Object.values(categorySalesMap).sort((a, b) => b.revenue - a.revenue);

    // 4. Peak Ordering Periods (by hour)
    const peakHours: Record<string, number> = {};
    allOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      const label = `${String(hour).padStart(2, '0')}:00`;
      peakHours[label] = (peakHours[label] || 0) + 1;
    });

    // 5. AR Engagement & Conversion Metrics
    const arViews = await prisma.analyticsEvent.count({
      where: { cafeId: cafe.id, eventType: 'AR_VIEW' },
    });
    const arInteractions = await prisma.analyticsEvent.count({
      where: { cafeId: cafe.id, eventType: 'AR_INTERACT' },
    });
    const cartAdds = await prisma.analyticsEvent.count({
      where: { cafeId: cafe.id, eventType: 'CART_ADD' },
    });
    const arPurchases = nonCancelledOrders.filter((o) =>
      o.items.some((i) => ['Single Origin Espresso', 'Velvet Flat White', 'Golden Butter Croissant'].includes(i.productName))
    ).length;

    const arConversionRate = arViews > 0 ? Math.round((arPurchases / arViews) * 100) : 0;

    // 6. Inventory health summary
    const lowStockCount = await prisma.inventoryItem.count({
      where: {
        cafeId: cafe.id,
        currentStock: {
          lte: prisma.inventoryItem.fields.minStockThreshold,
        },
      },
    });

    // 7. Table occupancy
    const tableCount = await prisma.cafeTable.count({
      where: { cafeId: cafe.id },
    });
    const occupiedTableCount = await prisma.cafeTable.count({
      where: { cafeId: cafe.id, status: 'OCCUPIED' },
    });

    return apiSuccess({
      currency: cafe.currency,
      metrics: {
        totalOrdersCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        statusCounts,
        topProducts,
        categoryPerformance,
        peakHours,
        arAnalytics: {
          arViews,
          arInteractions,
          arPurchases,
          arConversionRate,
        },
        inventory: {
          lowStockCount,
        },
        seating: {
          totalTables: tableCount,
          occupiedTables: occupiedTableCount,
          occupancyRate: tableCount > 0 ? Math.round((occupiedTableCount / tableCount) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return apiError('Unable to compute analytics overview', 'ANALYTICS_ERROR', 500);
  }
}
