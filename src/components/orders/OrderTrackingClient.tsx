'use client';

import React, { useEffect, useState } from 'react';
import { OrderDetailDto } from '@/types/cart';
import {
  CheckCircle2,
  Clock,
  Coffee,
  AlertCircle,
  ArrowLeft,
  Receipt,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import PaymentModal from '@/components/cart/PaymentModal';

interface OrderTrackingClientProps {
  initialOrder: OrderDetailDto;
}

export default function OrderTrackingClient({ initialOrder }: OrderTrackingClientProps) {
  const [order, setOrder] = useState<OrderDetailDto>(initialOrder);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchOrderStatus = async () => {
    try {
      const res = await fetch(`/api/public/orders/${order.id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to poll order status', err);
    }
  };

  // Poll status every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrderStatus, 5000);
    return () => clearInterval(interval);
  }, [order.id]);

  // Pipeline steps
  const steps = [
    { key: 'PENDING', label: 'Received', desc: 'Sent to kitchen' },
    { key: 'CONFIRMED', label: 'Accepted', desc: 'In queue' },
    { key: 'PREPARING', label: 'Preparing', desc: 'Crafting order' },
    { key: 'READY', label: 'Ready', desc: 'Ready for table' },
    { key: 'SERVED', label: 'Served', desc: 'Completed' },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="mobile-container" style={{ padding: '2rem 1rem 4rem 1rem' }}>
      {/* Back button & Table info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <Link
          href={`/menu?table=${order.tableNumber}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary-terracotta)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Add More Items</span>
        </Link>

        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <RotateCcw size={12} />
          Live synced
        </span>
      </div>

      {/* Main Order Status Card */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--bg-terracotta-subtle)',
            color: 'var(--primary-terracotta)',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Coffee size={14} />
          <span>Table {order.tableNumber}</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>{order.orderNumber}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Dynamic Status Banner */}
        <div
          style={{
            backgroundColor:
              order.status === 'READY'
                ? 'var(--status-green-bg)'
                : order.status === 'PREPARING'
                ? 'var(--status-amber-bg)'
                : 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '1.1rem',
              fontWeight: 700,
              color:
                order.status === 'READY'
                  ? 'var(--status-green)'
                  : order.status === 'PREPARING'
                  ? 'var(--status-amber)'
                  : 'var(--primary-espresso)',
              marginBottom: '0.2rem',
            }}
          >
            {order.status === 'PENDING' && 'Order Received • In Queue'}
            {order.status === 'CONFIRMED' && 'Order Accepted by Kitchen'}
            {order.status === 'PREPARING' && 'Barista is Crafting Your Order'}
            {order.status === 'READY' && 'Your Order is Ready!'}
            {order.status === 'SERVED' && 'Enjoy Your Meal!'}
            {order.status === 'COMPLETED' && 'Order Finished • Thank You!'}
            {order.status === 'CANCELLED' && 'Order Cancelled'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {order.status === 'PREPARING'
              ? `Estimated prep time: ~${order.estimatedTimeMin} mins`
              : order.status === 'READY'
              ? 'Our team is bringing it to Table ' + order.tableNumber
              : 'Our kitchen team will update this screen as preparation begins.'}
          </span>
        </div>

        {/* Progress Pipeline */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            margin: '1.5rem 0',
          }}
        >
          {steps.map((step, idx) => {
            const stepIdx = statusOrder.indexOf(step.key);
            const isCompleted = currentIndex >= stepIdx;
            const isCurrent = currentIndex === stepIdx;

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted
                      ? 'var(--primary-terracotta)'
                      : 'var(--bg-surface-elevated)',
                    border: `2px solid ${isCompleted ? 'var(--primary-terracotta)' : 'var(--border-strong)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} strokeWidth={2.5} /> : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? 'var(--primary-espresso)' : 'var(--text-muted)',
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bill & Itemized Details */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <Receipt size={18} color="var(--primary-espresso)" />
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Order Summary</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.92rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>
                  {item.quantity}x {item.productName}
                </span>
                {item.customizations.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.customizations.map((c, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        • {c.optionName} {c.priceModifier > 0 ? `(+₹${c.priceModifier})` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontWeight: 600 }}>₹{item.itemTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.customerNotes && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Note for Kitchen:</strong> {order.customerNotes}
          </div>
        )}

        {/* Totals */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>GST & Service ({order.subtotal > 0 ? ((order.tax / order.subtotal) * 100).toFixed(0) : 5}%)</span>
            <span>₹{order.tax.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--primary-espresso)',
              borderTop: '1px dashed var(--border-strong)',
              paddingTop: '0.5rem',
              marginTop: '0.25rem',
            }}
          >
            <span>Total</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.82rem',
            }}
          >
            <span>Payment Status:</span>
            <span
              style={{
                fontWeight: 700,
                color: order.paymentStatus === 'PAID' ? 'var(--status-green)' : 'var(--status-amber)',
              }}
            >
              {order.paymentStatus === 'PAID' ? '✓ Paid' : 'Pay at Counter / Unpaid'}
            </span>
          </div>

          {/* Pay Online / Settle Button if unpaid */}
          {order.paymentStatus !== 'PAID' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsPaymentModalOpen(true)}
              style={{
                marginTop: '1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <CreditCard size={16} />
              <span>Pay Now • ₹{order.total.toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      {isPaymentModalOpen && (
        <PaymentModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          total={order.total}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            fetchOrderStatus();
          }}
        />
      )}
    </div>
  );
}
