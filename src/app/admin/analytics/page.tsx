import React from 'react';
import AnalyticsClient from '@/components/admin/AnalyticsClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sales & Analytics | CaféNova Management',
};

export default function AnalyticsAdminPage() {
  return <AnalyticsClient />;
}
