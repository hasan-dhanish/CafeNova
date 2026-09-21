'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { TableInfoDto } from '@/types/menu';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  table: TableInfoDto | null;
  taxRate?: number;
}

export default function CartDrawer({ table, taxRate = 5 }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, clearCart, isCartOpen, closeCart, subtotal, itemCount } = useCart();
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!isCartOpen) return null;

  const estimatedTax = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
  const grandTotal = Math.round((subtotal + estimatedTax) * 100) / 100;

  const handleCheckout = async () => {
    if (!table) {
      setErrorMsg('Please scan a valid table QR code to place an order.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        tableId: table.id,
        customerNotes: customerNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          optionIds: i.selectedOptions.map((o) => o.id),
        })),
      };

      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to place order.');
      }

      // Success! Clear cart and route to live order status screen
      clearCart();
      closeCart();
      router.push(`/orders/${json.data.orderId}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Something went wrong while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31, 26, 23, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 110,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={closeCart}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideLeft 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="var(--primary-espresso)" />
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Your Order ({itemCount})</h2>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Table Notice */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: table ? 'var(--bg-terracotta-subtle)' : 'var(--status-red-bg)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {table ? (
            <span>
              Ordering for <strong>Table {table.tableNumber}</strong>
            </span>
          ) : (
            <span style={{ color: 'var(--status-red)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={15} />
              No table selected. Order cannot be routed.
            </span>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: 'var(--status-red-bg)',
              color: 'var(--status-red)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cart Item List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={40} strokeWidth={1.5} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: 'var(--primary-espresso)', marginBottom: '0.3rem' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.85rem' }}>Add some artisan coffees and sourdough treats from the menu.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                    {item.product.name}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                    ₹{item.totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Selected Customizations breakdown */}
                {item.selectedOptions.length > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {item.selectedOptions.map((opt) => (
                      <span
                        key={opt.id}
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'var(--bg-surface-elevated)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          marginRight: '0.35rem',
                          marginTop: '0.2rem',
                        }}
                      >
                        {opt.name}
                        {opt.priceModifier > 0 ? ` (+₹${opt.priceModifier})` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quantity Controls and Remove button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.4rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-espresso)',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      style={{
                        padding: '0 0.6rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        minWidth: '24px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-espresso)',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.3rem',
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Kitchen Notes */}
          {items.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <label
                htmlFor="kitchen-notes"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.35rem',
                }}
              >
                Special Kitchen Instructions (Optional)
              </label>
              <textarea
                id="kitchen-notes"
                rows={2}
                placeholder="e.g., Extra hot, serve dessert after sandwich, no straw..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                maxLength={300}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  resize: 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Drawer Footer Summary & Place Order */}
        {items.length > 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>Item Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <span>GST & Services ({taxRate}%)</span>
              <span>₹{estimatedTax.toFixed(2)}</span>
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
              }}
            >
              <span>Total Amount</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={isSubmitting || !table}
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '0.85rem',
                marginTop: '0.5rem',
                opacity: isSubmitting || !table ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <span>Sending to Kitchen...</span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
