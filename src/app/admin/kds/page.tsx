import React from 'react';
import KitchenDisplayClient from '@/components/staff/KitchenDisplayClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Kitchen Display (KDS) | CaféNova Management',
  description: 'Real-time kitchen display for baristas and culinary staff.',
};

export default function KdsPage() {
  return <KitchenDisplayClient />;
}
