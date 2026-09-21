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
  try {
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
            The café system is currently undergoing maintenance. Please check back shortly.
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
  } catch (error) {
    console.error('Failed to load menu data:', error);
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-espresso)', marginBottom: '0.75rem' }}>
            Menu Updating
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            The café kitchen database is initializing. Please tap below to refresh the live menu.
          </p>
          <a
            href="javascript:location.reload()"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--primary-terracotta)',
              color: '#FAF7F2',
              fontWeight: 600,
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Refresh Menu
          </a>
        </div>
      </div>
    );
  }
}
