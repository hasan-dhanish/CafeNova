import React, { useState } from 'react';
import { X, Trash2, ArrowRight, CheckCircle2, Coffee } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onClearCart: () => void;
  tableNumber?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onClearCart,
  tableNumber = 'T02',
}) => {
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const extra = item.milk.includes('+₹40') ? 40 : 0;
    return acc + (item.variant.price + extra) * item.quantity;
  }, 0);

  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  const handleCheckout = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setOrderSuccess(true);
    setTimeout(() => {
      onClearCart();
      setOrderSuccess(false);
      onClose();
    }, 2400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 22, 12, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 110,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#1E2818',
          borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-20px 0 50px rgba(0,0,0,0.5)',
          color: '#FAFDF7',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A3B19B', fontWeight: 700 }}>
              Swayed Table Service
            </span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#FAFDF7' }}>
              Your Order • Table {tableNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FAFDF7',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orderSuccess ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '999px',
                  backgroundColor: '#4A6B3E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#FAFDF7',
                  boxShadow: '0 8px 24px rgba(74, 107, 62, 0.5)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#FAFDF7', marginBottom: '0.5rem' }}>
                Order Sent to Barista!
              </h3>
              <p style={{ color: '#A3B19B', fontSize: '0.88rem', lineHeight: 1.4 }}>
                Freshly whisked and being prepared for Table {tableNumber}.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#A3B19B', padding: '2rem' }}>
              <Coffee size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.95rem' }}>Your table basket is empty</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.7 }}>
                Explore the orbital carousel to add drinks
              </p>
            </div>
          ) : (
            items.map((item, index) => {
              const extra = item.milk.includes('+₹40') ? 40 : 0;
              const itemTotal = (item.variant.price + extra) * item.quantity;

              return (
                <div
                  key={`${item.variant.id}-${index}`}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                  }}
                >
                  <img
                    src={item.variant.cupImage}
                    alt={item.variant.name}
                    style={{
                      width: '48px',
                      height: '60px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FAFDF7' }}>
                      {item.variant.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#A3B19B', marginTop: '2px' }}>
                      {item.milk} • {item.sweetness}
                    </p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C4D4BB', marginTop: '4px' }}>
                      ₹{itemTotal}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.2rem 0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                      style={{ color: '#FAFDF7', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      style={{ color: '#FAFDF7', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Billing */}
        {items.length > 0 && !orderSuccess && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'rgba(20, 28, 16, 0.95)',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A3B19B' }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#A3B19B' }}>
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#FAFDF7',
                paddingTop: '0.4rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#4A6B3E',
                color: '#FAFDF7',
                padding: '0.95rem',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(74, 107, 62, 0.4)',
                cursor: 'pointer',
              }}
            >
              <span>Confirm Order (Table {tableNumber})</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
