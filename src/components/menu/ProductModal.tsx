'use client';

import React, { useEffect, useState } from 'react';
import { ProductDto, CustomizationOptionDto } from '@/types/menu';
import { X, Clock, Sparkles, Check, Info, Box } from 'lucide-react';
import Image from 'next/image';
import ArModelViewer from '@/components/ar/ArModelViewer';
import RecommendedPairings from './RecommendedPairings';

interface ProductModalProps {
  product: ProductDto | null;
  onClose: () => void;
  currency?: string;
  onAddToCart?: (product: ProductDto, selectedOptions: CustomizationOptionDto[], finalPrice: number) => void;
}

export default function ProductModal({
  product,
  onClose,
  currency = 'INR',
  onAddToCart,
}: ProductModalProps) {
  // Selected option IDs per group
  const [selectedOptionsMap, setSelectedOptionsMap] = useState<Record<string, string[]>>({});
  const [isArOpen, setIsArOpen] = useState(false);

  // Reset or initialize default selections when product changes
  useEffect(() => {
    if (!product) return;

    const initial: Record<string, string[]> = {};
    product.customizationGroups.forEach((group) => {
      const defaults = group.options
        .filter((opt) => opt.isDefault && opt.isAvailable)
        .map((opt) => opt.id);

      if (defaults.length > 0) {
        initial[group.id] = defaults;
      } else if (group.isRequired && group.options.length > 0) {
        initial[group.id] = [group.options[0].id];
      } else {
        initial[group.id] = [];
      }
    });

    setSelectedOptionsMap(initial);

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const handleOptionToggle = (
    groupId: string,
    optionId: string,
    maxSelect: number,
    isRequired: boolean
  ) => {
    setSelectedOptionsMap((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(optionId);

      if (maxSelect === 1) {
        // Radio behavior
        if (exists && !isRequired) {
          return { ...prev, [groupId]: [] };
        }
        return { ...prev, [groupId]: [optionId] };
      } else {
        // Multi-select behavior
        if (exists) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        } else {
          if (current.length < maxSelect) {
            return { ...prev, [groupId]: [...current, optionId] };
          }
          return prev;
        }
      }
    });
  };

  // Calculate calculated total price with customization modifiers
  let extraCost = 0;
  const selectedOptionsList: CustomizationOptionDto[] = [];

  product.customizationGroups.forEach((group) => {
    const selectedIds = selectedOptionsMap[group.id] || [];
    group.options.forEach((opt) => {
      if (selectedIds.includes(opt.id)) {
        extraCost += opt.priceModifier;
        selectedOptionsList.push(opt);
      }
    });
  });

  const finalUnitPrice = product.price + extraCost;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31, 26, 23, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header / Image */}
        <div style={{ position: 'relative', width: '100%', height: '240px', backgroundColor: '#EDE7DE' }}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 600px) 100vw, 560px"
              priority
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No Image Available
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close details"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-espresso)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <X size={20} />
          </button>

          {/* AR interactive button */}
          {product.arModelUrl && (
            <button
              type="button"
              onClick={() => setIsArOpen(true)}
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                backgroundColor: 'rgba(56, 35, 25, 0.92)',
                color: '#FAF7F2',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
              }}
            >
              <Box size={15} color="#EBB682" />
              <span>View in 3D / AR</span>
            </button>
          )}
        </div>

        {/* Product Details Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Title and Dietary row */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {product.isVegetarian && <span className="badge badge-veg">Vegetarian</span>}
              {product.isVegan && <span className="badge badge-vegan">Vegan</span>}
              {product.isGlutenFree && <span className="badge badge-gf">Gluten Free</span>}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginLeft: 'auto',
                }}
              >
                <Clock size={13} />
                {product.preparationTimeMin} mins
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{product.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {product.description}
            </p>
          </div>

          {/* Customization Groups */}
          {product.customizationGroups.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                Recipe Customization
              </h3>

              {product.customizationGroups.map((group) => {
                const selected = selectedOptionsMap[group.id] || [];
                return (
                  <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-espresso)' }}>
                        {group.name}
                        {group.isRequired && (
                          <span style={{ color: 'var(--primary-terracotta)', marginLeft: '0.25rem' }}>*</span>
                        )}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {group.maxSelect === 1 ? 'Choose 1' : `Up to ${group.maxSelect}`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {group.options.map((opt) => {
                        const isChecked = selected.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleOptionToggle(group.id, opt.id, group.maxSelect, group.isRequired)
                            }
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              border: `1px solid ${isChecked ? 'var(--primary-terracotta)' : 'var(--border-subtle)'}`,
                              backgroundColor: isChecked ? 'var(--bg-terracotta-subtle)' : 'var(--bg-surface)',
                              textAlign: 'left',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: group.maxSelect === 1 ? '50%' : '4px',
                                  border: `2px solid ${isChecked ? 'var(--primary-terracotta)' : 'var(--border-strong)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isChecked ? 'var(--primary-terracotta)' : 'transparent',
                                }}
                              >
                                {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                              </div>
                              <span style={{ fontSize: '0.9rem', fontWeight: isChecked ? 600 : 400 }}>
                                {opt.name}
                              </span>
                            </div>

                            {opt.priceModifier > 0 && (
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                +₹{opt.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Smart Recommendations */}
          <RecommendedPairings productId={product.id} />

          {/* Pricing & Footer Action */}
          <div
            style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Total</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                ₹{finalUnitPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem 1.5rem' }}
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart(product, selectedOptionsList, finalUnitPrice);
                }
                onClose();
              }}
            >
              Add to Cart • ₹{finalUnitPrice.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* 3D / AR Viewer Modal */}
      {isArOpen && (
        <ArModelViewer
          product={product}
          onClose={() => setIsArOpen(false)}
          onProceedToCustomize={() => setIsArOpen(false)}
        />
      )}
    </div>
  );
}
