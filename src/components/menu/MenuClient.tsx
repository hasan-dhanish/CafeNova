'use client';

import React, { useState, useMemo } from 'react';
import { MenuDataResponse, ProductDto, CustomizationOptionDto } from '@/types/menu';
import ProductModal from './ProductModal';
import CartDrawer from '@/components/cart/CartDrawer';
import CartFloatingButton from '@/components/cart/CartFloatingButton';
import { useCart } from '@/context/CartContext';
import { Search, MapPin, Clock, Sparkles, Filter, X, ChevronRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface MenuClientProps {
  initialData: MenuDataResponse;
  initialTable?: string;
}

export default function MenuClient({ initialData, initialTable }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'gf'>('all');
  const [activeModalProduct, setActiveModalProduct] = useState<ProductDto | null>(null);

  const { cafe, table, categories } = initialData;

  // Flatten products for search & filter
  const allProducts = useMemo(() => {
    return categories.flatMap((cat) => cat.products);
  }, [categories]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // 2. Category Filter
      if (selectedCategorySlug !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategorySlug);
        if (!cat || product.categoryId !== cat.id) return false;
      }

      // 3. Dietary Filter
      if (dietaryFilter === 'veg' && !product.isVegetarian) return false;
      if (dietaryFilter === 'vegan' && !product.isVegan) return false;
      if (dietaryFilter === 'gf' && !product.isGlutenFree) return false;

      return true;
    });
  }, [allProducts, categories, searchQuery, selectedCategorySlug, dietaryFilter]);

  const { addToCart } = useCart();

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Customer Menu Card Brand Header */}
      <header
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-espresso)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FAF7F2',
              }}
            >
              ☕
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--primary-espresso)',
                  lineHeight: 1.1,
                }}
              >
                {cafe.name}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--primary-terracotta)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Digital Menu Card
              </span>
            </div>
          </div>

          {/* Table Indicator in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'var(--primary-espresso)',
                color: '#FAF7F2',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <MapPin size={13} />
              <span>{table ? `Table ${table.tableNumber}` : 'Takeaway / Counter'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 1. Sticky Search & Category Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="container" style={{ padding: '0.75rem 1rem' }}>
          {/* Search Input Bar */}
          <div style={{ position: 'relative', width: '100%', marginBottom: '0.75rem' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search espresso, artisan bakery, cold brews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.4rem 0.65rem 2.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                outline: 'none',
                fontSize: '0.92rem',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Tabs (Scrollable on Mobile) */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              scrollbarWidth: 'none',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategorySlug('all')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                border: '1px solid',
                borderColor:
                  selectedCategorySlug === 'all' ? 'var(--primary-terracotta)' : 'var(--border-subtle)',
                backgroundColor:
                  selectedCategorySlug === 'all' ? 'var(--primary-terracotta)' : 'var(--bg-surface)',
                color: selectedCategorySlug === 'all' ? '#FFFFFF' : 'var(--text-primary)',
              }}
            >
              All Items ({allProducts.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategorySlug(cat.slug)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary-terracotta)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--primary-terracotta)' : 'var(--bg-surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  }}
                >
                  {cat.name} ({cat.products.length})
                </button>
              );
            })}
          </div>

          {/* Dietary Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Filter size={13} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setDietaryFilter('all')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: dietaryFilter === 'all' ? 700 : 400,
                color: dietaryFilter === 'all' ? 'var(--primary-espresso)' : 'var(--text-secondary)',
                textDecoration: dietaryFilter === 'all' ? 'underline' : 'none',
              }}
            >
              All
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setDietaryFilter('veg')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: dietaryFilter === 'veg' ? 700 : 400,
                color: dietaryFilter === 'veg' ? 'var(--status-green)' : 'var(--text-secondary)',
                textDecoration: dietaryFilter === 'veg' ? 'underline' : 'none',
              }}
            >
              Veg
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setDietaryFilter('vegan')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: dietaryFilter === 'vegan' ? 700 : 400,
                color: dietaryFilter === 'vegan' ? '#127559' : 'var(--text-secondary)',
                textDecoration: dietaryFilter === 'vegan' ? 'underline' : 'none',
              }}
            >
              Vegan
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setDietaryFilter('gf')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: dietaryFilter === 'gf' ? 700 : 400,
                color: dietaryFilter === 'gf' ? 'var(--status-amber)' : 'var(--text-secondary)',
                textDecoration: dietaryFilter === 'gf' ? 'underline' : 'none',
              }}
            >
              Gluten-Free
            </button>
          </div>
        </div>
      </div>

      {/* 2. Menu Items Section */}
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-espresso)', marginBottom: '0.4rem' }}>
              No items match your criteria
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Try searching with a different term or resetting the dietary filters.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategorySlug('all');
                setDietaryFilter('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveModalProduct(product)}
              >
                {/* Product Image */}
                <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#EBE5DC' }}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 360px"
                      loading="lazy"
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
                      Freshly prepared
                    </div>
                  )}

                  {/* AR model badge */}
                  {product.arModelUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        backgroundColor: 'rgba(56, 35, 25, 0.9)',
                        color: '#FAF7F2',
                        padding: '0.25rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={12} color="#EBB682" />
                      <span>AR Ready</span>
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      right: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    <Clock size={12} />
                    <span>{product.preparationTimeMin} min</span>
                  </div>
                </div>

                {/* Card Content */}
                <div
                  style={{
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Dietary Badges */}
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.4rem' }}>
                      {product.isVegetarian && <span className="badge badge-veg">Veg</span>}
                      {product.isVegan && <span className="badge badge-vegan">Vegan</span>}
                      {product.isGlutenFree && <span className="badge badge-gf">GF</span>}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--primary-espresso)' }}>
                      {product.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                      }}
                    >
                      {product.description}
                    </p>
                  </div>

                  {/* Card Bottom Row: Price & Customize Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalProduct(product);
                      }}
                    >
                      <span>Customize</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Product Detail Modal */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
        currency={cafe.currency}
        onAddToCart={(prod, selectedOptions, finalPrice) => {
          addToCart(prod, selectedOptions, finalPrice);
        }}
      />

      {/* 4. Cart Floating Bar & Slide-Over Drawer */}
      <CartFloatingButton />
      <CartDrawer table={table} taxRate={cafe.taxRate} />
    </div>
  );
}
