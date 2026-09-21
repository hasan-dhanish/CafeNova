import React from 'react';
import TableManagementClient from '@/components/admin/TableManagementClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Table Management & QR Codes | CaféNova Management',
};

export default function TablesAdminPage() {
  return <TableManagementClient />;
}
