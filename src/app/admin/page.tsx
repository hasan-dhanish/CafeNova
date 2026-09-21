import React from 'react';
import KitchenDisplayClient from '@/components/staff/KitchenDisplayClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Operations Dashboard | CaféNova Management',
};

export default function AdminIndexPage() {
  return <KitchenDisplayClient />;
}
