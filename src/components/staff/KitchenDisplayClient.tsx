'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OrderDetailDto } from '@/types/cart';
import {
  Clock,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RotateCw,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function KitchenDisplayClient() {
  const [orders, setOrders] = useState<OrderDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Update live elapsed timer every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio chime for new orders
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio chime unavailable', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/staff/orders?filter=active');
      const json = await res.json();
      if (res.ok && json.success) {
        const fetchedOrders: OrderDetailDto[] = json.data;

        // Play chime if new pending order arrived
        if (soundEnabled && fetchedOrders.length > lastOrderCount) {
          const hasNewPending = fetchedOrders.some((o) => o.status === 'PENDING');
          if (hasNewPending) playChime();
        }

        setOrders(fetchedOrders);
        setLastOrderCount(fetchedOrders.length);
      }
    } catch (err) {
      console.error('KDS fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled, lastOrderCount]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/staff/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Filter into Kanban columns
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem' }}>
      {/* KDS Control Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary-espresso)' }}>
            Kitchen Display System (KDS)
          </h1>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: 'var(--primary-terracotta)',
              color: '#FFFFFF',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {orders.length} Active Tickets
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (!soundEnabled) playChime();
              setSoundEnabled(!soundEnabled);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {soundEnabled ? <Volume2 size={16} color="var(--status-green)" /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchOrders}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 3-Column Kitchen Kanban Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          flex: 1,
          alignItems: 'start',
        }}
      >
        {/* Column 1: New Orders */}
        <div
          style={{
            backgroundColor: '#ECE7E0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
              📥 New Orders ({pendingOrders.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-sync</span>
          </div>

          {pendingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No incoming orders in queue.
            </div>
          ) : (
            pendingOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    borderLeft: '4px solid var(--primary-terracotta)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {/* Ticket Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-espresso)' }}>
                        {order.orderNumber}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--primary-terracotta)',
                        }}
                      >
                        Table {order.tableNumber}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: elapsed > 8 ? 'var(--status-red-bg)' : 'var(--bg-surface-elevated)',
                        color: elapsed > 8 ? 'var(--status-red)' : 'var(--text-secondary)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Clock size={12} />
                      <span>{elapsed}m ago</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginBottom: '0.75rem' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                          <span style={{ fontWeight: 700 }}>
                            {item.quantity}x {item.productName}
                          </span>
                        </div>
                        {item.customizations.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--primary-terracotta)',
                              fontWeight: 600,
                              paddingLeft: '0.75rem',
                            }}
                          >
                            ↳ {c.optionName}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.customerNotes && (
                    <div
                      style={{
                        backgroundColor: '#FFF8E6',
                        border: '1px solid #FFE4A3',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: '#8A5D00',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <strong>Kitchen Note:</strong> {order.customerNotes}
                    </div>
                  )}

                  {/* Action */}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', padding: '0.6rem' }}
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                  >
                    <span>Start Brewing / Cooking</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Column 2: In Preparation */}
        <div
          style={{
            backgroundColor: '#ECE7E0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--status-amber)' }}>
              ⏳ In Preparation ({preparingOrders.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Barista active</span>
          </div>

          {preparingOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No orders currently in prep.
            </div>
          ) : (
            preparingOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isOverdue = elapsed > order.estimatedTimeMin;
              return (
                <div
                  key={order.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    borderLeft: `4px solid ${isOverdue ? 'var(--status-red)' : 'var(--status-amber)'}`,
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-espresso)' }}>
                        {order.orderNumber}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: 'var(--status-amber)',
                        }}
                      >
                        Table {order.tableNumber}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: isOverdue ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                        color: isOverdue ? 'var(--status-red)' : 'var(--status-amber)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <Clock size={12} />
                      <span>{elapsed}m / est {order.estimatedTimeMin}m</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginBottom: '0.75rem' }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                          {item.quantity}x {item.productName}
                        </span>
                        {item.customizations.map((c, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--primary-terracotta)',
                              fontWeight: 600,
                              paddingLeft: '0.75rem',
                            }}
                          >
                            ↳ {c.optionName}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {order.customerNotes && (
                    <div
                      style={{
                        backgroundColor: '#FFF8E6',
                        border: '1px solid #FFE4A3',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: '#8A5D00',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <strong>Kitchen Note:</strong> {order.customerNotes}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    style={{ width: '100%', padding: '0.6rem', backgroundColor: 'var(--status-amber)', borderColor: 'var(--status-amber)' }}
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                  >
                    <span>Mark Ready for Serving</span>
                    <CheckCircle2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Column 3: Ready for Serving */}
        <div
          style={{
            backgroundColor: '#ECE7E0',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--status-green)' }}>
              🔔 Ready for Table ({readyOrders.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for pickup</span>
          </div>

          {readyOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No items waiting for runner.
            </div>
          ) : (
            readyOrders.map((order) => (
              <div
                key={order.id}
                className="card"
                style={{
                  padding: '1rem',
                  borderLeft: '4px solid var(--status-green)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-espresso)' }}>
                      {order.orderNumber}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--status-green)',
                      }}
                    >
                      Deliver to Table {order.tableNumber}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--status-green-bg)',
                      color: 'var(--status-green)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    READY
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem', marginBottom: '0.75rem' }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {item.quantity}x {item.productName}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    backgroundColor: 'var(--status-green)',
                    color: '#FFFFFF',
                    border: 'none',
                  }}
                  onClick={() => updateOrderStatus(order.id, 'SERVED')}
                >
                  <span>Mark Served & Complete</span>
                  <CheckCircle2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
