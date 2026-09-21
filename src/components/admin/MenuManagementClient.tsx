'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  RotateCw,
  Check,
  X,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Image from 'next/image';

interface OptionDto {
  id: string;
  name: string;
  priceModifier: number;
}

interface CustomizationGroupDto {
  id: string;
  name: string;
  options: OptionDto[];
}

interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  arModelUrl: string | null;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTimeMin: number;
  customizationGroups: CustomizationGroupDto[];
}

interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  products: ProductDto[];
}

export default function MenuManagementClient() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('8');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/admin/menu/products');
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data.categories);
        if (!categoryId && json.data.categories.length > 0) {
          setCategoryId(json.data.categories[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load menu products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (productId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/menu/products/${productId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !current }),
      });
      if (res.ok) {
        fetchMenu();
      }
    } catch (err) {
      console.error('Failed to toggle availability', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/menu/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          description: description.trim(),
          price: Number(price),
          imageUrl: imageUrl.trim() || null,
          preparationTimeMin: Number(prepTime),
          isVegetarian,
          isVegan,
          isGlutenFree,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create product');
      }

      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setIsAddModalOpen(false);
      fetchMenu();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allProducts = categories.flatMap((c) => c.products);
  const displayedCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter((c) => c.slug === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Action Bar */}
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
            Menu & Catalog Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
            Instant stock availability toggling (86'd), recipe customizations, and item creation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchMenu}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={16} />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid',
            borderColor: selectedCategory === 'all' ? 'var(--primary-terracotta)' : 'var(--border-subtle)',
            backgroundColor: selectedCategory === 'all' ? 'var(--primary-terracotta)' : 'var(--bg-surface)',
            color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-primary)',
          }}
        >
          All Items ({allProducts.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedCategory === cat.slug ? 'var(--primary-terracotta)' : 'var(--border-subtle)',
              backgroundColor: selectedCategory === cat.slug ? 'var(--primary-terracotta)' : 'var(--bg-surface)',
              color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-primary)',
            }}
          >
            {cat.name} ({cat.products.length})
          </button>
        ))}
      </div>

      {/* Product Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {displayedCategories.map((cat) => (
          <div key={cat.id}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary-espresso)' }}>
              {cat.name}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {cat.products.map((product) => (
                <div
                  key={product.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: product.isAvailable ? 1 : 0.65,
                    borderLeft: `4px solid ${product.isAvailable ? 'var(--status-green)' : 'var(--status-red)'}`,
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                        {product.name}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                      {product.description}
                    </p>

                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                      {product.isVegetarian && <span className="badge badge-veg">Veg</span>}
                      {product.isVegan && <span className="badge badge-vegan">Vegan</span>}
                      {product.isGlutenFree && <span className="badge badge-gf">GF</span>}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }}>
                        <Clock size={12} /> {product.preparationTimeMin} min
                      </span>
                    </div>

                    {/* Customizations tags */}
                    {product.customizationGroups.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>Customizations: </span>
                        {product.customizationGroups.map((g) => g.name).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Availability Toggle */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: product.isAvailable ? 'var(--status-green)' : 'var(--status-red)' }}>
                      {product.isAvailable ? 'Available for Ordering' : "Sold Out (86'd)"}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(product.id, product.isAvailable)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: product.isAvailable ? 'var(--status-green)' : 'var(--text-muted)',
                      }}
                      title="Toggle availability"
                    >
                      {product.isAvailable ? (
                        <ToggleRight size={28} color="var(--status-green)" />
                      ) : (
                        <ToggleLeft size={28} color="var(--status-red)" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 26, 23, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Add New Menu Product</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardamom Rose Cold Brew"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', backgroundColor: '#FFFFFF' }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="250.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description & Ingredients
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of flavors, roast, and culinary notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)' }}
                />
              </div>

              {/* Dietary checkboxes */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={isVegetarian}
                    onChange={(e) => setIsVegetarian(e.target.checked)}
                  />
                  <span>Vegetarian</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                  />
                  <span>Vegan</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                  />
                  <span>Gluten Free</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
