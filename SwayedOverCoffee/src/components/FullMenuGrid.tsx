import React, { useState } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { BAKERY_AND_FOOD, FLAVOR_VARIANTS } from '../data/menuData';
import { FlavorVariant, CartItem } from '../types';

interface FullMenuGridProps {
  onSelectVariant: (variant: FlavorVariant) => void;
  onAddToCartDirect: (item: CartItem) => void;
}

export const FullMenuGrid: React.FC<FullMenuGridProps> = ({
  onSelectVariant,
  onAddToCartDirect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Signature Matcha', 'Coffee', 'Bakery', 'Breakfast'];

  const allItems = [
    ...FLAVOR_VARIANTS.map((v) => ({
      id: v.id,
      name: v.name,
      category: 'Signature Matcha',
      price: v.price,
      imageUrl: v.cupImage,
      description: v.description,
      isVariant: true,
      variantData: v,
    })),
    ...BAKERY_AND_FOOD.map((f) => ({
      ...f,
      isVariant: false,
      variantData: null,
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '5.5rem 1.5rem 4rem',
        color: '#FAFDF7',
      }}
    >
      {/* Title & Search */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: '#FAFDF7', marginBottom: '0.5rem' }}>
          Swayed Over Coffee Menu
        </h2>
        <p style={{ color: '#A3B19B', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Freshly brewed single origin coffees, ceremonial matcha, and homemade French butter pastries.
        </p>

        {/* Search Input */}
        <div
          style={{
            maxWidth: '420px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={18} color="#A3B19B" style={{ position: 'absolute', left: '1rem' }} />
          <input
            type="text"
            placeholder="Search iced drinks, pastries, breakfast..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '999px',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              color: '#FAFDF7',
              fontSize: '0.9rem',
              outline: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: selectedCategory === cat ? '#4A6B3E' : 'rgba(255, 255, 255, 0.08)',
              color: selectedCategory === cat ? '#FAFDF7' : '#A3B19B',
              border: selectedCategory === cat ? '1px solid #78A766' : '1px solid rgba(255, 255, 255, 0.12)',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: 'rgba(30, 42, 24, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
          >
            <div style={{ width: '100%', height: '180px', position: 'relative', overflow: 'hidden', backgroundColor: '#182214' }}>
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(24, 34, 18, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#FAFDF7',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                }}
              >
                {item.category}
              </span>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FAFDF7', marginBottom: '0.35rem' }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#A3B19B', lineHeight: 1.4, marginBottom: '1rem' }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FAFDF7' }}>
                  ₹{item.price}
                </span>

                {item.isVariant && item.variantData ? (
                  <button
                    type="button"
                    onClick={() => onSelectVariant(item.variantData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#4A6B3E',
                      color: '#FAFDF7',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <Sparkles size={14} />
                    <span>View 3D</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onAddToCartDirect({
                        variant: {
                          id: item.id,
                          name: item.name,
                          subtitle: item.category,
                          price: item.price,
                          cupImage: item.imageUrl,
                          ingredientIcon: '🥐',
                          ingredientName: item.name,
                          accentColor: '#4A6B3E',
                          description: item.description,
                          tag: 'Bakery',
                          notes: ['Artisan Bakery'],
                        },
                        quantity: 1,
                        sweetness: 'Standard',
                        milk: 'Standard',
                        iceLevel: 'Standard',
                      })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#FAFDF7',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
