import React from 'react';
import InventoryClient from '@/components/admin/InventoryClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stock & Inventory Management | CaféNova Management',
};

export default function InventoryAdminPage() {
  return <InventoryClient />;
}
