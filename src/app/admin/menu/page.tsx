import React from 'react';
import MenuManagementClient from '@/components/admin/MenuManagementClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Menu & Catalog Management | CaféNova Management',
};

export default function MenuAdminPage() {
  return <MenuManagementClient />;
}
