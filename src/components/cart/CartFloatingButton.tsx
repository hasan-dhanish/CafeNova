'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartFloatingButton() {
  const { itemCount, subtotal, openCart, isCartOpen } = useCart();

  if (itemCount === 0 || isCartOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '480px',
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={openCart}
        style={{
          width: '100%',
          backgroundColor: 'var(--primary-espresso)',
          color: '#FAF7F2',
          borderRadius: 'var(--radius-lg)',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 24px rgba(42, 24, 16, 0.25)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-terracotta)',
              color: '#FFFFFF',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {itemCount}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>View Order</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{subtotal.toFixed(2)}</span>
          <ArrowRight size={18} />
        </div>
      </button>
    </div>
  );
}
