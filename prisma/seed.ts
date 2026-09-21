import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CaféNova database...');

  // 1. Create Default Café
  const cafe = await prisma.cafe.upsert({
    where: { slug: 'cafenova-flagship' },
    update: {},
    create: {
      name: 'CaféNova Artisan Roasters',
      slug: 'cafenova-flagship',
      address: '14 Koramangala 4th Block, Bengaluru, KA 560034',
      currency: 'INR',
      taxRate: 5.0, // 5% GST
      isActive: true,
    },
  });

  console.log(`Café created: ${cafe.name} (${cafe.id})`);

  // 2. Create Users (Admin, Manager, Staff)
  const passwordHash = await bcrypt.hash('CafeNova@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cafenova.com' },
    update: {},
    create: {
      cafeId: cafe.id,
      name: 'Elena Vance (Owner)',
      email: 'admin@cafenova.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'barista@cafenova.com' },
    update: {},
    create: {
      cafeId: cafe.id,
      name: 'Leo Chen (Lead Barista)',
      email: 'barista@cafenova.com',
      passwordHash,
      role: 'STAFF',
    },
  });

  console.log(`Users created: ${admin.email}, ${staff.email}`);

  // 3. Create Café Tables with QR security tokens
  const tablesData = [
    { tableNumber: 'T01', capacity: 2, qrSecretToken: 'tok_t01_a9f8e7d6' },
    { tableNumber: 'T02', capacity: 2, qrSecretToken: 'tok_t02_b8e7d6c5' },
    { tableNumber: 'T03', capacity: 4, qrSecretToken: 'tok_t03_c7d6c5b4' },
    { tableNumber: 'T04', capacity: 4, qrSecretToken: 'tok_t04_d6c5b4a3' },
    { tableNumber: 'T05', capacity: 6, qrSecretToken: 'tok_t05_e5b4a392' },
    { tableNumber: 'Outdoor-01', capacity: 4, qrSecretToken: 'tok_out01_f4a39281' },
  ];

  for (const t of tablesData) {
    await prisma.cafeTable.upsert({
      where: {
        cafeId_tableNumber: {
          cafeId: cafe.id,
          tableNumber: t.tableNumber,
        },
      },
      update: {},
      create: {
        cafeId: cafe.id,
        tableNumber: t.tableNumber,
        capacity: t.capacity,
        qrSecretToken: t.qrSecretToken,
        status: 'AVAILABLE',
      },
    });
  }

  // 4. Create Categories
  const categoriesData = [
    { name: 'Specialty Coffee', slug: 'specialty-coffee', description: 'Single-origin espresso and pour-overs roasted in-house', displayOrder: 1 },
    { name: 'Cold Brews & Iced', slug: 'cold-brews-iced', description: 'Slow-steeped 18hr cold brews and iced refreshers', displayOrder: 2 },
    { name: 'Artisan Bakery', slug: 'artisan-bakery', description: 'Freshly baked sourdough pastries and viennoiserie', displayOrder: 3 },
    { name: 'Sourdough Sandwiches', slug: 'sourdough-sandwiches', description: 'Warm toasted pressed sandwiches on house sourdough', displayOrder: 4 },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: {
        cafeId_slug: {
          cafeId: cafe.id,
          slug: cat.slug,
        },
      },
      update: {},
      create: {
        cafeId: cafe.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
      },
    });
    categoriesMap[cat.slug] = created.id;
  }

  // 5. Create Inventory Items
  const inventoryItems = [
    { name: 'Specialty Coffee Beans (Single Origin)', unit: 'g', currentStock: 15000, minStockThreshold: 2000, costPerUnit: 1.2 },
    { name: 'Organic Whole Milk', unit: 'ml', currentStock: 30000, minStockThreshold: 5000, costPerUnit: 0.08 },
    { name: 'Oat Milk (Barista Edition)', unit: 'ml', currentStock: 18000, minStockThreshold: 3000, costPerUnit: 0.25 },
    { name: 'Almond Milk', unit: 'ml', currentStock: 12000, minStockThreshold: 2000, costPerUnit: 0.28 },
    { name: 'Butter Croissants (Raw Pre-baked)', unit: 'pcs', currentStock: 45, minStockThreshold: 15, costPerUnit: 45 },
    { name: 'Artisan Sourdough Loaf', unit: 'slices', currentStock: 80, minStockThreshold: 20, costPerUnit: 12 },
    { name: 'Smoked Mozzarella', unit: 'g', currentStock: 4000, minStockThreshold: 800, costPerUnit: 1.1 },
    { name: 'Wild Blossom Honey', unit: 'ml', currentStock: 3000, minStockThreshold: 500, costPerUnit: 0.6 },
  ];

  for (const inv of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        cafeId: cafe.id,
        name: inv.name,
        unit: inv.unit,
        currentStock: inv.currentStock,
        minStockThreshold: inv.minStockThreshold,
        costPerUnit: inv.costPerUnit,
      },
    });
  }

  // 6. Create Products with Customization Groups & Options
  const productsData = [
    {
      name: 'Single Origin Espresso',
      categorySlug: 'specialty-coffee',
      description: 'Double shot extracted from medium roast Ethiopian Yirgacheffe with notes of bergamot and jasmine.',
      price: 180,
      imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&auto=format&fit=crop&q=80',
      arModelUrl: '/models/coffee_cup.glb',
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      preparationTimeMin: 4,
      displayOrder: 1,
      customizations: [
        {
          name: 'Roast Profile',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Ethiopian Floral (Default)', priceModifier: 0, isDefault: true },
            { name: 'Colombian Dark Chocolate', priceModifier: 20, isDefault: false },
          ],
        },
      ],
    },
    {
      name: 'Velvet Flat White',
      categorySlug: 'specialty-coffee',
      description: 'Double ristretto blended with micro-foamed silky milk, creating a balanced, sweet espresso profile.',
      price: 240,
      imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=800&auto=format&fit=crop&q=80',
      arModelUrl: '/models/coffee_cup.glb',
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      preparationTimeMin: 5,
      displayOrder: 2,
      customizations: [
        {
          name: 'Milk Preference',
          isRequired: true,
          minSelect: 1,
          maxSelect: 1,
          options: [
            { name: 'Whole Organic Milk', priceModifier: 0, isDefault: true },
            { name: 'Oat Milk (Oatly Barista)', priceModifier: 45, isDefault: false },
            { name: 'Almond Milk', priceModifier: 45, isDefault: false },
          ],
        },
        {
          name: 'Sweetness',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Unsweetened', priceModifier: 0, isDefault: true },
            { name: 'Organic Honey (+15ml)', priceModifier: 30, isDefault: false },
            { name: 'Brown Demerara Sugar', priceModifier: 0, isDefault: false },
          ],
        },
      ],
    },
    {
      name: 'Nitro Cold Brew Reserve',
      categorySlug: 'cold-brews-iced',
      description: 'Steeped cold for 18 hours, nitrogen-infused for a creamy cascading head and naturally smooth finish.',
      price: 260,
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      preparationTimeMin: 3,
      displayOrder: 1,
      customizations: [
        {
          name: 'Flavor Notes',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Pure Black', priceModifier: 0, isDefault: true },
            { name: 'Vanilla Bean Cream Float', priceModifier: 40, isDefault: false },
          ],
        },
      ],
    },
    {
      name: 'Golden Butter Croissant',
      categorySlug: 'artisan-bakery',
      description: 'Layered French laminations with Normandy butter, baked golden crisp outside with an airy, honeycomb interior.',
      price: 190,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
      arModelUrl: '/models/croissant.glb',
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      preparationTimeMin: 2,
      displayOrder: 1,
      customizations: [
        {
          name: 'Serving Style',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Warmed Up', priceModifier: 0, isDefault: true },
            { name: 'Room Temperature', priceModifier: 0, isDefault: false },
            { name: 'Side Artisanal Fig Jam & Butter', priceModifier: 35, isDefault: false },
          ],
        },
      ],
    },
    {
      name: 'Smoked Mozzarella & Pesto Sourdough',
      categorySlug: 'sourdough-sandwiches',
      description: 'House-made basil walnut pesto, smoked buffalo mozzarella, sun-dried tomatoes pressed on stone-ground sourdough.',
      price: 360,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      preparationTimeMin: 12,
      displayOrder: 1,
      customizations: [
        {
          name: 'Crust / Toasting',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          options: [
            { name: 'Crisp Panini Press', priceModifier: 0, isDefault: true },
            { name: 'Lightly Toasted', priceModifier: 0, isDefault: false },
          ],
        },
        {
          name: 'Add-ons',
          isRequired: false,
          minSelect: 0,
          maxSelect: 2,
          options: [
            { name: 'Extra Melted Smoked Mozzarella', priceModifier: 60, isDefault: false },
            { name: 'Pickled Jalapeños & Olives', priceModifier: 30, isDefault: false },
          ],
        },
      ],
    },
  ];

  for (const item of productsData) {
    const categoryId = categoriesMap[item.categorySlug];
    const product = await prisma.product.create({
      data: {
        cafeId: cafe.id,
        categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        arModelUrl: item.arModelUrl || null,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        preparationTimeMin: item.preparationTimeMin,
        displayOrder: item.displayOrder,
      },
    });

    if (item.customizations) {
      for (const group of item.customizations) {
        const custGroup = await prisma.productCustomizationGroup.create({
          data: {
            productId: product.id,
            name: group.name,
            isRequired: group.isRequired,
            minSelect: group.minSelect,
            maxSelect: group.maxSelect,
          },
        });

        for (const opt of group.options) {
          await prisma.customizationOption.create({
            data: {
              groupId: custGroup.id,
              name: opt.name,
              priceModifier: opt.priceModifier,
              isDefault: opt.isDefault,
            },
          });
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
