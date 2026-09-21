import React from 'react';
import { prisma } from '@/lib/prisma';
import MenuClient from '@/components/menu/MenuClient';
import { MenuDataResponse } from '@/types/menu';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Digital Menu | CaféNova',
  description: 'Explore our artisan coffees, slow cold brews, freshly baked sourdough pastries, and sandwiches.',
};

interface PageProps {
  searchParams: Promise<{
    table?: string;
  }>;
}

export default async function MenuPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const tableParam = resolvedSearchParams?.table;

  // 1. Fetch default active café
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
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Café not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          The café system is currently undergoing maintenance.
        </p>
      </div>
    );
  }

  // 2. Fetch table info if table parameter is present
  let tableInfo = null;
  if (tableParam) {
    const table = await prisma.cafeTable.findFirst({
      where: {
        cafeId: cafe.id,
        tableNumber: tableParam,
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

  // 3. Fetch active categories and available products
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

  const menuData: MenuDataResponse = {
    cafe,
    table: tableInfo,
    categories,
  };

  return <MenuClient initialData={menuData} initialTable={tableParam} />;
}
