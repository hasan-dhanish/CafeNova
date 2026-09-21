'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Users,
  RotateCw,
  Award,
  Sparkles,
  PieChart,
  Clock,
  Eye,
} from 'lucide-react';

interface AnalyticsData {
  currency: string;
  metrics: {
    totalOrdersCount: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: Record<string, number>;
    topProducts: { name: string; quantity: number; revenue: number }[];
    categoryPerformance: { name: string; quantity: number; revenue: number }[];
    peakHours: Record<string, number>;
    arAnalytics: {
      arViews: number;
      arInteractions: number;
      arPurchases: number;
      arConversionRate: number;
    };
    inventory: {
      lowStockCount: number;
    };
    seating: {
      totalTables: number;
      occupiedTables: number;
      occupancyRate: number;
    };
  };
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics/overview');
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Calculating operational analytics...</p>
      </div>
    );
  }

  const { metrics, currency } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--primary-espresso)' }}>
            Sales & Operational Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
            Authoritative metrics aggregated directly from active customer orders, 3D interaction telemetry, and stock transactions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={fetchAnalytics}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RotateCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Card 1: Gross Sales */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Gross Revenue
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-terracotta-subtle)', color: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-espresso)', display: 'block' }}>
            ₹{metrics.totalRevenue.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            From completed & live orders
          </span>
        </div>

        {/* Card 2: Total Orders */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Orders
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-espresso)', display: 'block' }}>
            {metrics.totalOrdersCount}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Table sessions created
          </span>
        </div>

        {/* Card 3: AOV */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Average Ticket (AOV)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-amber-bg)', color: 'var(--status-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={16} />
            </div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-espresso)', display: 'block' }}>
            ₹{metrics.averageOrderValue.toFixed(2)}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Average basket spend
          </span>
        </div>

        {/* Card 4: Occupancy */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Seating Occupancy
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-slate-bg)', color: 'var(--status-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} />
            </div>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-espresso)', display: 'block' }}>
            {metrics.seating.occupancyRate}%
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {metrics.seating.occupiedTables} / {metrics.seating.totalTables} tables occupied
          </span>
        </div>
      </div>

      {/* AR Food Visualization Telemetry Card */}
      <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-terracotta)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={18} color="var(--primary-terracotta)" />
          <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--primary-espresso)' }}>
            AR Food Visualization &amp; Conversion Analytics
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Actual customer telemetry tracking 3D model inspections and conversion into placed orders:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>3D Model Views</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
              {metrics.arAnalytics.arViews}
            </span>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>360° Orbit Interactions</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
              {metrics.arAnalytics.arInteractions}
            </span>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>AR-Enabled Items Ordered</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-green)' }}>
              {metrics.arAnalytics.arPurchases}
            </span>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>AR-to-Purchase Conversion</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-terracotta)' }}>
              {metrics.arAnalytics.arConversionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Top items & Category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Top Performing Menu Items */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={18} color="var(--primary-terracotta)" />
            <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--primary-espresso)' }}>
              Top Selling Products
            </h2>
          </div>

          {metrics.topProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No product sales recorded yet. As orders are placed, top performers rank here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {metrics.topProducts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-terracotta-subtle)',
                        color: 'var(--primary-terracotta)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{p.name}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-espresso)' }}>
                      ₹{p.revenue.toFixed(2)}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.quantity} units sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Performance Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="var(--primary-espresso)" />
            <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--primary-espresso)' }}>
              Category Performance
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {metrics.categoryPerformance.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.65rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{cat.name}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {cat.quantity} items prepared
                  </span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                  ₹{cat.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
