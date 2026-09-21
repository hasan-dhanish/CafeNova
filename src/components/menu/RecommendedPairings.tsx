'use client';

import React, { useState, useEffect } from 'react';
import { RecommendedProduct } from '@/lib/recommendations';
import { Sparkles, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

interface RecommendedPairingsProps {
  productId: string;
}

export default function RecommendedPairings({ productId }: RecommendedPairingsProps) {
  const [items, setItems] = useState<RecommendedProduct[]>([]);
  const [label, setLabel] = useState<string>('Pairs Well With');
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/public/recommendations?productId=${productId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.recommendations) {
          setItems(res.data.recommendations);
          if (res.data.label) setLabel(res.data.label);
        }
      })
      .catch(() => {});
  }, [productId]);

  if (items.length === 0) return null;

  const handleQuickAdd = async (rec: RecommendedProduct) => {
    // Fetch product details to add to cart
    try {
      const res = await fetch(`/api/public/menu`);
      const json = await res.json();
      if (res.ok && json.success && json.data?.categories) {
        const allProds = json.data.categories.flatMap((c: any) => c.products);
        const fullProd = allProds.find((p: any) => p.id === rec.id);
        if (fullProd) {
          addToCart(fullProd, [], fullProd.price);
          setAddedIds((prev) => [...prev, rec.id]);
          setTimeout(() => {
            setAddedIds((prev) => prev.filter((id) => id !== rec.id));
          }, 2000);
        }
      }
    } catch (e) {
      console.error('Quick add error', e);
    }
  };

  return (
    <div
      style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
        <Sparkles size={15} color="var(--primary-terracotta)" />
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-espresso)' }}>
          {label}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {items.map((item) => {
          const isAdded = addedIds.includes(item.id);

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: '#EBE5DC',
                    flexShrink: 0,
                  }}
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                      ☕
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-espresso)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ₹{item.price.toFixed(2)} &bull;{' '}
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary-terracotta)' }}>{item.reason}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickAdd(item)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isAdded ? 'var(--status-green)' : 'var(--bg-surface)',
                  color: isAdded ? '#FFFFFF' : 'var(--primary-espresso)',
                  border: `1px solid ${isAdded ? 'var(--status-green)' : 'var(--border-strong)'}`,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isAdded ? (
                  <>
                    <Check size={13} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
