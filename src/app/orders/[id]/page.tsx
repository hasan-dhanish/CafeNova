import React from 'react';
import { prisma } from '@/lib/prisma';
import OrderTrackingClient from '@/components/orders/OrderTrackingClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  });
  return {
    title: order ? `Order ${order.orderNumber} Status | CaféNova` : 'Order Status | CaféNova',
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      table: {
        select: {
          tableNumber: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              preparationTimeMin: true,
            },
          },
          customizations: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const maxPrepTime = Math.max(
    ...order.items.map((i) => i.product?.preparationTimeMin || 10),
    5
  );

  const initialOrderDto = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    customerNotes: order.customerNotes,
    createdAt: order.createdAt.toISOString(),
    tableNumber: order.table.tableNumber,
    estimatedTimeMin: maxPrepTime,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemTotal: item.itemTotal,
      customizations: item.customizations.map((c) => ({
        groupName: c.groupName,
        optionName: c.optionName,
        priceModifier: c.priceModifier,
      })),
    })),
  };

  return <OrderTrackingClient initialOrder={initialOrderDto} />;
}
